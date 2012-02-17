var SWFLoader = function(url, chara, object) {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        ;
    }
    request.open('GET', url);
    // http://javascript.g.hatena.ne.jp/edvakf/20100607/1275931930
    request.overrideMimeType('text/plain; charset=x-user-defined');
    request.send(null);
}