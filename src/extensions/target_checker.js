/**
 * @fileoverview TargetChecker for courseware.
 */
'use strict';

goog.provide("Entry.TargetChecker");

goog.require("Entry.Extension");

/**
 * @constructor
 */
Entry.TargetChecker = function(code, isForEdit) {
    this.isForEdit = isForEdit;
    this.goals = [];
    this.unachievedGoals = [];
    if (this.isForEdit)
        this.watchingBlocks = [];
    this.blocks = [
        "check_object_property",
        "check_block_execution",
        "check_lecture_goal"
    ];

    this.isFail = false;
    this.isSuccess = false;

    this.script = new Entry.Code([], this);

    Entry.achieve = this.achieveCheck.bind(this);
    Entry.achieveEvent = new Entry.Event();
    Entry.addEventListener("stop", this.reset.bind(this));

    Entry.registerAchievement = this.registerAchievement.bind(this);
};

Entry.Utils.inherit(Entry.Extension, Entry.TargetChecker);

(function(p) {
    p.renderView = function() {
        this._view = Entry.Dom('li', {
            class: "targetChecker"
        });

        this._view.bindOnClick(function(e) {
            Entry.playground.injectObject(this);
        }.bind(this));
        this.updateView();
        return this._view;
    };

    p.updateView = function() {
        var len = this.goals.length;
        this._view.text("목표 : " + (len - this.unachievedGoals.length) +
                        " / " + len);
        if (this.isSuccess)
            this._view.addClass("success")
        else
            this._view.removeClass("success")
        if (this.isFail)
            this._view.addClass("fail")
        else
            this._view.removeClass("fail")
    };

    p.achieveCheck = function(isSuccess, id) {
        if (this.isFail)
            return;
        if (isSuccess)
            this.achieveGoal(id);
        else
            this.fail(id);
    };

    p.achieveGoal = function(id) {
        if (this.isSuccess || this.isFail || this.unachievedGoals.indexOf(id) < 0)
            return;
        this.unachievedGoals.splice(this.unachievedGoals.indexOf(id), 1);
        if (this.unachievedGoals.length === 0) {
            this.isSuccess = true;
            Entry.achieveEvent.notify("success");
        }
        this.updateView();
    };

    p.fail = function() {
        if (this.isSuccess || this.isFail)
            return;
        this.isFail = true;
        Entry.achieveEvent.notify("fail");
        this.updateView();
    };

    p.reset = function() {
        this.unachievedGoals = this.goals.concat();
        this.isFail = false;
        this.isSuccess = false;
        this.updateView();
    };

    p.registerAchievement = function(block) {
        if (this.isForEdit)
            this.watchingBlocks.push(block);
        if (block.params[1] && this.goals.indexOf(block.params[0] < 0))
            this.goals.push(block.params[0])
        this.reset();
    };

})(Entry.TargetChecker.prototype);
