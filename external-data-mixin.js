/*! externalDataMixin | https://github.com/vflash/externalDataMixin */

var externalDataMixin = {
    //getExternalData: null, // function(nextProps, nextState) {return []};
    //objectIsExternalData: false,

    _isChangeStateForExData: false,
    _externalData: [],

    componentDidMount: function () {
        var setState = this.setState;
        var self = this;

        this.setState = function(state, end) {
            if (self.isMounted()) {
                self._isChangeStateForExData = true;
                setState.call(self, state, end);
            };
        };

        if (this.getExternalData) {
            this._externalData = this.getExternalData(this.props, this.state);
        };
    },

    shouldComponentUpdate: function(nextProps, nextState) {
        var nextData = this.getExternalData ? this.getExternalData(nextProps, nextState) : null;
        var exData = this._externalData;

        var props = this.props;

        if (this._isChangeStateForExData) {
            this._isChangeStateForExData = false;
            if (nextData) {
                this._externalData = nextData;
            };
            return true;
        };

        for(var i in nextProps) {
            var nextProp = nextProps[i];
            var prop = props[i];

            if (nextProp === prop) {
                continue;
            };

            if (this.objectIsExternalData && (typeof nextProp === typeof prop)) {
                continue;
            };

            if (nextData) {
                this._externalData = nextData;
            };

            return true;
        };

        if (nextData) {
            for(var j = nextData.length; j--;) {
                if (exData[j] !== nextData[j]) {
                    this._externalData = nextData;
                    return true;
                };
            };
        };

        tailExData(this);
        return false;
    },

    _checkExternalData: function() {
        if (!this.getExternalData) {
            tailExData(this);
            return;
        };

        var nextData = this.getExternalData(this.props, this.state);
        var exData = this._externalData;
        var change;

        for(var j = nextData.length; j--;) {
            if (exData[j] !== nextData[j]) {
                this._externalData = nextData;
                this.forceUpdate();
                return;
            };
        };

        tailExData(this);
    },
};


function tailExData(self) {
    var refs = self.refs;

    for (var i in refs) {
        var elem = refs[i];

        if (elem._checkExternalData) {
            elem._checkExternalData();

        } else if (elem.tagName) {
            continue;
        } else if (elem.setState) {
            elem.setState({});
        };
    };
};

if (typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = externalDataMixin;
};

