window.ajax = function ajax(url, data, callback) {
    let xhr = new XMLHttpRequest();
    let str = '?';
    if(data) {
        for (let key in data) {
            if (data.hasOwnProperty(key)) {
                let val = data[key].push ? JSON.stringify(data[key]) : data[key];
                str += ( key + '=' + val + '&');
            }
        }
    } else {
        data = null;
    }
    xhr.open('GET', url + str, true);
    xhr.send(null);
    xhr.onreadystatechange = function() {
        if (xhr.readyState != 4) return;
        if (xhr.status != 200) {
            callback(JSON.parse(xhr.status + ': ' + xhr.statusText));
        } else {
            callback(JSON.parse(xhr.responseText));
        }
    }
};