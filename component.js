'use strict';

class UnixDatePicker{
    constructor(){
        this.roundTo = 5;
    }

    get ModelDate(){
        return this.date;
    }

    set ModelDate(value) {
        this.date = value;
        this.bindToModel();
    }

    get RoundTo(){
        return this.roundTo * 60;
    }

    $onInit(){
        this.ngModelCtrl.$parsers.push((date) => moment(date).unix());

        this.ngModelCtrl.$formatters.push((value) => {
            let date = value ? new Date(Number(value) * 1000) : new Date();
            this.ModelDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), this.roundMinutes(date.getMinutes()));
        });
    }

    roundMinutes(minutes){
        return this.roundTo * Math.ceil(minutes / this.roundTo);
    }

    bindToModel(){
        this.ngModelCtrl.$setViewValue(this.ModelDate);
        this.ngModelCtrl.$commitViewValue();
    }
}

angular
    .module('datepicker')
    .component('unixDatePicker', {
        template: require('./unixDatePicker.html'),
        controller: UnixDatePicker,
        controllerAs: '$ctrl',
        require: {
            ngModelCtrl: 'ngModel'
        },
        bindings: {
            minDate: '<?'
        }
    });
