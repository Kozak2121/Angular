class AnimationHelper{
    constructor($animate, $animateCss, $element, $parent){
        this.$animateCss = $animateCss;
        this.$animate = $animate;

        this.$element = $element;
        this.$parent = $parent;

        this.block = angular.element(document.createElement('div'));

        this.block.css({
            'z-index': '99',
            'background': 'black',
            'opacity': '0.2',
            'position': 'absolute'
        })
    }

    open(){
        this.block.css({
            'width': `${this.$parent[0].offsetWidth}`,
            'height': `${this.$parent[0].offsetHeight}`,
            'top': `${this.$parent[0].offsetTop}px`,
            'left': `${this.$parent[0].offsetLeft}px`
        })
        this.$parent.css({
            'overflow': 'hidden'
        })
        this.block.appendTo(this.$parent[0]);

        this.elementRect = this.$element[0].getBoundingClientRect();

        this.staticTop = this.elementRect.top;
        this.staticLeft = this.$element[0].offsetLeft;


        this.newLeft = this.$parent[0].offsetLeft + (this.$parent[0].offsetWidth - this.$element[0].offsetWidth)/2 - 100;
        this.newTop = this.$parent[0].offsetTop + (this.$parent[0].offsetHeight - this.$element[0].offsetHeight)/2;

        this.$animate.addClass(this.$element, 'uncolapsed');
        
        return this.$animateCss(this.$element, {
            from: {top: `${this.staticTop}px`, left: `${this.staticLeft}px`},
            to: {top: `${this.newTop}px`, left: `${this.newLeft}px`},
            duration: 0.3
        }).start()
    }

    close(){
        this.$parent[0].removeChild(this.block[0]);
        this.$parent.css({
            'overflow': 'overlay'
        })
        return this.$animateCss(this.$element, {
            from: {top: `${this.newTop}px`, left: `${this.newLeft}px`},
            to: {top: `${this.staticTop}px`, left: `${this.staticLeft}px`},
            duration: 0.3
        })
        .start()
        .then(() => this.$animate.removeClass(this.$element, 'uncolapsed'))
    }
}

module.exports = (module) => {
    module
        .factory('ColumnAnimation', ($animate, $animateCss) => {
            return {
                getHelper: ($element, $parent) => 
                    new AnimationHelper($animate, $animateCss, $element, $parent)
            }
        })
    };