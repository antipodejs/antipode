class XHR {
    
    constructor ( params = {} ) {

        const _events = [
            'onreadystatechange',
            'ontimeout',
            'onerror',
            'onload',
            'onprogress',
            'onabort',
            'onloadstart',
            'onloadend'
        ];

        const XHR  = ( "onload" in new XMLHttpRequest() ) 
            ? XMLHttpRequest 
            : XDomainRequest;

        this.xhr = new XHR();

        _.assignIn( this,
            {
                method: 'GET',
                async: true,
                charset: 'UTF-8',
                contentType: 'aapplication/x-www-form-urlencoded',
                error: function() {}
            }, params );

        _events.forEach( function(event) {
            if ( this.xhr[event] ) {
                this[event] = this.xhr;
            }
        }.bind( this )); 
    };

    getJSON ( url, cb ) {
        this.xhr.open( this.method, url, this.async );
        this.xhr.send();

        this.xhr.onreadystatechange = function() {
            if ( this.readyState != 4 ) {
                return;
            }

            if ( this.status != 200 ) {
                this.error({
                    status: this.status 
                        ? this.statusText 
                        : 'request error'
                    });
                return;
            }
            typeof cb === 'function' && cb(JSON.parse(this.responseText));
        };
    }
}

XHR.get = (url, cb, params) => {
    (new XHR(params)).getJSON(url, cb);
};

export default XHR;
