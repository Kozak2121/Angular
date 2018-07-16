'use strict';

const ReminderProperties = ['id', 'user_id', 'subject', 'description', 'color',
                            'starts_at', 'ends_at', 'remind_for', 'remind_at',
                            'dismissed_at', 'created_at', 'updated_at',
                            'snoozed_for', 'snoozed_to', 'node_id', 'customer_name'];

angular
    .module('reminders')
    .constant('ReminderProperties', ReminderProperties)
    .factory('Reminder', ($rootScope, apiService, ElromcoObserver, $injector, $filter, ReminderProperties, moveBoardApi, moment) => {

        const { crud,
                allForNode,
                getForUser,
                snooze,
                dismiss } = moveBoardApi.reminders;

        function NotificationService(){
            return $injector.get('NotificationService');
        }

        class Reminder {
            constructor(options) {
                Object.keys(options).forEach((key) => {
                    if(ReminderProperties.includes(key)){
                        this[key] = options[key];
                    }
                })

                this.remind_for = this.remind_at ? this.remind_for : void 0;
            }

            get remindTime() {
                let date =  moment().unix();

                let diffRemind = date - this.remind_at; 
                let diffStart = date - this.starts_at;

                let key;

                if(diffRemind > 0 && diffStart > 0 || diffRemind < 0 && diffStart < 0) {
                    key = Math.abs(diffRemind) < Math.abs(diffStart) ? 'remind_at' : 'starts_at';
                } else if(diffRemind < 0 && diffStart > 0){
                    key = 'remind_at'
                } else {
                    key = 'starts_at';
                }

                return this[key];
            }

            get Color() {
                return this.color ? `#${this.color}` : void 0;
            }

            set Color(color) {
                this.color = color.substring(1, color.length);
            }

            get canEdit(){
                return $rootScope.currentUser.userId.uid == this.user_id && !this.dismissed_at;
            }

            static async getByRequest(condition) {
                let {data: {response}} = await apiService.postData(allForNode, condition);

                return $filter('orderBy')(response.map(reminder => new Reminder(reminder)), '-remindTime');
            }

            static async getByUser(condition) {
                angular.extend(condition, {user_id: $rootScope.currentUser.userId.uid});
                let {data: {response}} = await apiService.postData(getForUser, condition);

                return $filter('orderBy')(response.map(reminder => new Reminder(reminder)), '-remindTime');
            }

            async create(remindMe){
                this.remind_at = remindMe ? this.starts_at - this.remind_for * 60 : null;
                this.ends_at = this.starts_at;
                let {data: {response}} = await apiService.postData(crud, this);
                angular.extend(this, response);
                toastr.success(`You've saved the reminder`, 'Success');
                if($rootScope.currentUser.userId.uid == this.user_id){
                    NotificationService().setNotification(this);
                    ElromcoObserver.dispatch('reminderCalendar.update');
                }
            }
        
            async update(remindMe){
                this.remind_at = remindMe ? this.starts_at - this.remind_for * 60 : null;
                let {data: {response}} = await apiService.putData(`${crud}/${this.id}`, this);
                toastr.success(`You've saved the reminder`, 'Success');
                NotificationService().cancelNotification(this.id);
                if($rootScope.currentUser.userId.uid == this.user_id){
                    NotificationService().setNotification(this);
                } 
                ElromcoObserver.dispatch('reminderCalendar.update');
            }
        
            async snooze() {
                this.remind_at = moment().unix() + this.snoozed_for * 60;

                let condition = {
                    reminder_id: this.id,
                    remind_at: this.remind_at,
                    snoozed_for: this.snoozed_for,
                    snoozed_to: this.remind_at
                }
                let {data: {response}} = await apiService.postData(snooze, condition);
                angular.extend(this, response);
                toastr.success(`Reminder has been snoozed`, 'Success');
                NotificationService().cancelNotification(this.id);
                NotificationService().setNotification(this);
                ElromcoObserver.dispatch('reminderCalendar.update');
            }
        
            async dismiss() {
                let {data: {response}} = await apiService.postData(dismiss, {reminder_id: this.id, dismissed_at: moment().unix()})
                angular.extend(this, response)
                toastr.success(`Reminder has been dismissed`, 'Success');
                NotificationService().cancelNotification(this.id);
                ElromcoObserver.dispatch('reminderCalendar.update');
            }
        }

        return Reminder;
    });
