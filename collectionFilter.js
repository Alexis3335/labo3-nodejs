



export default class CollectionFilter {

    constructor(objects, params, model) {
        this.objects = objects;
        this.params = params;
        this.model = model;
    }


    get(){
        let objectList = this.objects;

        if(this.params != null){
            if('sort' in this.params){
                let sortType = this.params.sort;
                sortType = sortType.charAt(0).toUpperCase() + sortType.slice(1).toLowerCase();

                if(sortType in objectList[0])
                    objectList = objectList.sort((a, b) => (a[sortType] > b[sortType]) ? 1 : -1)
            }
        }

        return objectList;
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


}