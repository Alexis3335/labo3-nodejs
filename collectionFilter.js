



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
        let possibleParams = ["sort", "field", "limit", "offset"];

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



                if (sortType in objectList[0]) {
                    if (!desc)
                        objectList = objectList.sort((a, b) => (a[sortType] > b[sortType]) ? 1 : -1);
                    else
                        objectList = objectList.sort((a, b) => (a[sortType] < b[sortType]) ? 1 : -1);
                }

            }

            // Only show a specific field 

            if ("field" in lowercaseParams) {
                let field = lowercaseParams.field;
                let field_array = [];

                if(objectList.length > 1 && field in objectList[0]){

                    for(let obj of objectList){
                        if(!field_array.includes(obj[field]))
                            field_array.push(obj[field]);
                    }
                }

                let i = 1;

                objectList = field_array.map((elem,i) => ({[i] : elem}))
            }

            // Limit & offset

            if("limit" in lowercaseParams && "offset" in lowercaseParams){
                let limit = parseInt(lowercaseParams.limit);
                let offset = parseInt(lowercaseParams.offset);

                if(!isNaN(limit) && !isNaN(offset))
                    objectList = objectList.slice(limit * offset,limit * offset + limit);
            }

        }

        return objectList;
    }





}