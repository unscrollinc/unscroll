/*
 * Simple hash map using javascript objects and an ordered array.
 * Repeated elements are not allowed.
 *  
 * @param sort_method By default is ASC order, but you can specified whatever you want.
 *
 * The public methods are:
 *     -set
 *     -get
 *     -del
 *     -foreach
 * next step: Try to improve the insert method
 * https://gist.github.com/flopezluis/1006007#file-ordered_hm-js
 */
var HashMap = function (sort_method){
    var data = {};
    var order_keys = [];
    var default_sort =  function(a,b) {
        return a < b;
    };
    var sort = sort_method || default_sort;
    
    /*
     * Insert the new key using the sort method.
     */
    function insert(key) {
        var len = order_keys.length;
        if (len == 0) {
            order_keys.push(key);
        } else {
            for (i = 0; i < len; i++) {
                if (sort(key, order_keys[i])) {
                    if (order_keys[i-1] != key) { /* the element is not repeated */
                        order_keys.splice(i,0, key); 
                    }
                    break;
                }
            }
            if ( i== len) {
                order_keys.splice(i,0, key); 
            }
        }
    }
    
    function binarySearch(a, value, low, high) {
        if (high < low)
            return -1 // not found
        mid = parseInt(low + (high - low) / 2)
        if (a[mid] > value)
            return binarySearch(a, value, low, mid-1)
        else if (a[mid] < value)
            return binarySearch(a, value, mid+1, high)
        else
            return mid // found
    }
    
    function del(key) {
        delete data[key];
        var index = binarySearch(order_keys, key, 0, order_keys.length);
        if (index > -1) order_keys.splice(index,1);       
    }
    
    function set(key, value) {
        data[key] = value;
        insert(key);
    }
    
    function get(key) {
        return data[key];
    }
    
    /*
     * Executes a specified function on each ordered element of the array;
     * Stop if the callback returns false
     */
    function foreach(callback) {
        var len = order_keys.length;
        for (var i = 0; i < len; i++) {
            if (callback(order_keys[i], data[order_keys[i]]) === false) break;
        }
    }
    
    return {set:set, get:get, foreach:foreach, del:del};
}
