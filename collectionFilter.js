



export default class CollectionFilter {

    constructor(objects, params, model) {
        this.objects = objects;
        this.params = params;
        this.model = model;
    }


    static valueMatch(value, searchValue) {
        try {
            let exp = '^' + searchValue.toLowerCase().replace(/\*/g, '.*') + '$';
            return new RegExp(exp).test(value.toString().toLowerCase());
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    static compareNum(x, y) {
        if (x === y) return 0;
        else if (x < y) return -1;
        return 1;
    }

    static innerCompare(x, y) {
        if ((typeof x) === 'string')
            return x.localeCompare(y);
        else
            return this.compareNum(x, y);
    }

    get() {
        let objectList = this.objects;
        let possibleParams = ["sort", "fields", "limit", "offset"];

        let lowercaseParams = Object.fromEntries(
            Object.entries(this.params).map(([k, v]) => {
                let lowerKey = k.toLowerCase();

                if (possibleParams.includes(lowerKey))
                    return [k.toLowerCase(), v]
                else // Key is a field name, don't convert to lowercase
                    return [k, v];
            })
        );


        if (lowercaseParams != null) {

            let objectKeys = Object.keys(this.objects[0]);

            // Filters
            // Field = value      
            for (let key of objectKeys) {
                if (key in lowercaseParams) {
                    let searchString = lowercaseParams[key];
                    //Same key name multiple times
                    if (Array.isArray(searchString)) {
                        searchString = searchString[0]; // Take first value and ignore the others (for now)
                    }

                    objectList = objectList.filter((object) => CollectionFilter.valueMatch(object[key], searchString));
                }
            }



            // sorting
            if ("sort" in lowercaseParams) {


                let desc = false;
                let sort_args = lowercaseParams.sort.split(',');

                if (sort_args.length > 1 && sort_args[1].toLowerCase() === "desc") {
                    desc = true;
                }

                let sortType = sort_args[0];



                if (objectList.length > 0 && sortType in objectList[0]) {
                    if (!desc)
                        objectList = objectList.sort((a, b) => (a[sortType] > b[sortType]) ? 1 : -1);
                    else
                        objectList = objectList.sort((a, b) => (a[sortType] < b[sortType]) ? 1 : -1);
                }

            }


            // Limit & offset

            if ("limit" in lowercaseParams && "offset" in lowercaseParams) {
                let limit = parseInt(lowercaseParams.limit);
                let offset = parseInt(lowercaseParams.offset);

                if (!isNaN(limit) && !isNaN(offset))
                    objectList = objectList.slice(limit * offset, limit * offset + limit);
            }


            // Only show one or more specific field(s)
            if ("fields" in lowercaseParams) {
                let fields = lowercaseParams.fields.split(",");

                // Clean up fields array, remove invalid keys
                for (let field of fields) {

                    if (!objectKeys.includes(field)) {
                        const index = fields.indexOf(field);
                        fields.splice(index, 1);
                    }

                }


                if (objectList.length > 0 && fields.length > 0) {

                    const uniqueObjects = new Set();

                    for (let obj of objectList) {
                        let temp_obj = {};
                        for (let field of fields) {
                            temp_obj[field] = obj[field];
                        }

                        const temp_obj_str = JSON.stringify(temp_obj);
                        uniqueObjects.add(temp_obj_str);


                    }
                    objectList = Array.from(uniqueObjects).map((objStr) => JSON.parse(objStr));
                }






            }


        }

        return objectList;
    }

    static equal(ox, oy) {
        let equal = true;
        Object.keys(ox).forEach(function (member) {
            if (ox[member] != oy[member]) {
                equal = false;
                return false;
            }
        })
        return equal;
    }





}