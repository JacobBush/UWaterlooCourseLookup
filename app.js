/*
 *  Starter code for University of Waterloo CS349 - Spring 2017 - A3.
 *	Refer to the JS examples shown in lecture for further reference.
 *  Note: this code uses ECMAScript 6.
 *  Updated 2017-07-12.
 *  Updated by Jacob Bush to complete application
 */
	
"use strict";

// Get your own API key from https://uwaterloo.ca/api/register
var apiKey = 'd727966f281037381727e3a61dcba6f6 ';
var baseURL = 'https://api.uwaterloo.ca/v2/';
var dataType = '.json';
var dataEndpoint = "courses";

(function(exports) {

	/* A Model class */
    class AppModel {
		constructor() {
			this._observers = [];
            this.data_slice = null;
		}

        // You can add attributes / functions here to store the data

        // Call this function to retrieve data from a UW API endpoint
        loadData(endpoint, constraints) {
            var that = this;
            this.constraints=constraints;
            if (constraints.courseid != null) {
                // form 2 submitted
                var courseid = constraints.courseid;
                if (courseid != "") {
                    courseid = "/" + courseid
                } else {

                };

                var endpointAddition = courseid;
            } else if (constraints.subject != null) {
                // form 1 submitted
                if (constraints.subject != "") {
                    if (constraints.catalognumber != "") {
                        // both fields were filled
                        var endpointAddition = "/" + constraints.subject + "/" + constraints.catalognumber;
                    } else {
                        // just subject filled
                        var endpointAddition = "/" + constraints.subject;
                    }
                } else {
                    // subject empty
                    if (constraints.catalognumber != "") {
                        // catalognumber filled without subject
                        // return incomplete form error
                        var endpointAddition = "";
                    } else {
                        // no constraints on form submitted
                        var endpointAddition = "";
                    }
                }
            } else {
                //??
                var endpointAddition = "";
            }
            $.getJSON(baseURL + endpoint + endpointAddition + dataType + "?key=" + apiKey,
                function (data) {
                    // Do something with the data; probably store it
                    // in the Model to be later read by the View.
                    // Use that (instead of this) to refer to the instance 
                    // of AppModel inside this function.
                    that.data = data;
                    that.data_slice = null;
                    if (data.meta.method_id == 1471 || data.meta.method_id == 1439) {
                        if (data.data.length >= 10) {
                            that.data_slice = [0, 10];
                        } else {
                            that.data_slice = [0, data.data.length];
                        }
                    }
                    that.notify(); // Notify View(s)
                }
            );
        }

        updateSlice (direction) {
            if (this.data_slice == null) {
                return;
            }
            switch (direction) {
                case "left":
                    if (this.data_slice[0] - 10 < 0) {
                        this.data_slice[0] = 0;
                    } else {
                        this.data_slice[0] = this.data_slice[0] - 10;
                    }
                    this.data_slice[1] = this.data_slice[0] + 10;
                    break;
                case "right":
                    if (this.data_slice[1] + 10 > this.data.data.length) {
                        this.data_slice[1] = this.data.data.length;
                    } else {
                        this.data_slice[1] = this.data_slice[1] + 10;
                    }
                    this.data_slice[0] = this.data_slice[1] - 10;
                    break;
                default:
            }
        }
		
		// Add observer functionality to AppModel objects:
		
		// Add an observer to the list
		addObserver(observer) {
            this._observers.push(observer);
            observer.updateView(this, null);
        }
		
		// Notify all the observers on the list
		notify(args) {
            _.forEach(this._observers, function(obs) {
                obs.updateView(this, args);
            });
        }
    }

    /*
     * A view class.
     * model:  the model we're observing
     * div:  the HTML div where the content goes
     */
    class AppView {
		constructor(model, div) {
			this.model = model;
			this.div = div;
			model.addObserver(this); // Add this View as an Observer
		}
        updateView(obs, args) {
            // Add code here to update the View
            this.handleData();
        };

        handleData() {
            var data = this.model.data;
            if (data) {
                switch (data.meta.method_id) {
                    case 1471:
                        // no additional paramters
                        var html = this.makeDefaultHtmlTable(data.data.slice(this.model.data_slice[0], this.model.data_slice[1]));
                        break;
                    case 1153:
                        // course ID specified
                        var html = this.makeIdSpecifiedHtmlTable(data.data);
                        break;
                    case 1439:
                        // Course subject specified
                        var html = this.makeSubjectSpecifiedHtmlTable(data.data.slice(this.model.data_slice[0], this.model.data_slice[1]));
                        break;
                    case 1447:
                        // Course subject and Catalog Number Specified
                        var html = this.makeIdSpecifiedHtmlTable(data.data);
                        break;
                    default:
                        console.log(data);
                }
                $(this.div).find("div#dataDump").html(html);
                var dataSliceHtml = this.formatDataSliceHtml(this.model.data_slice);
                $(this.div).find("div#dataDumpHeader").html(dataSliceHtml);
                $(this.div).find("div#dataDumpFooter").html(dataSliceHtml);
                $('.loader').hide();
            }
        }

        makeDefaultHtmlTable(data) {
            if (data !== null && typeof data === 'object' && data.length >= 1) {
                var keys = Object.keys(data[0]);
                var html = "<table class = \"dataReturnTable\"><thead><tr>";
                $.each(keys, function (index, key) {
                     html += "<th>" + key.replace(/_/g, " ") + "</th>";
                });
                html += "</tr></thead><tbody>"
                $.each(data, function (index, datum) {
                     html += "<tr>";
                     $.each (datum, function (k, v) {
                        html += "<td>";
                        if (k == "course_id") {
                            html += "<a href = \"javascript:void(0)\" class = \"idOnclickLink\">" + v + "</a>";
                        } else if (k == "subject") {
                            html += "<a href = \"javascript:void(0)\" class = \"subjectOnclickLink\">" + v + "</a>";
                        } else {
                            html += v;
                        }
                        html += "</td>";
                     });
                     html += "</tr>";
                });
                html += "</tbody></table>";
                return html;
            } else {
                return "";
            }
        }

        makeIdSpecifiedHtmlTable (data) {
            // Should have a check here for good data.
            // Going to assume data is good.
            var html = "<table class = \"dataReturnTable\">";
            html += "<thead><tr><th>Property</th><th>Value</th></tr></thead><tbody>";
            $.each(data, function (k, v) {
                if (k == "offerings") {
                    html += "<tr>";
                    html += "<td class = \"capitalize bold\">" + k.replace("_", " ") + "</td>";
                    html += "<td>";
                    $.each(v, function (k, v) {
                        html += (v ? (k.replace(/_/g, " ") + "<br />") : "");
                    });
                    html += "</td>";
                    html += "</tr>";
                } else if (k == "url" ){
                    html += "<tr>";
                    html += "<td class = \"bold\">URL</td>";
                    html += "<td><a href = \"" + v + "\">" + v + "</a></td></tr>";
                } else if (k == "course_id") {
                    html += "<td class = \"capitalize bold\">" + k.replace(/_/g, " ") + "</td>";
                    html += "<td>" + "<a href = \"javascript:void(0)\" class = \"idOnclickLink\">" + v + "</a>" + "</td>";
                    html += "</tr>"
                } else if (k == "subject") {
                    html += "<td class = \"capitalize bold\">" + k.replace(/_/g, " ") + "</td>";
                    html += "<td>" + "<a href = \"javascript:void(0)\" class = \"subjectOnclickLink\">" + v + "</a>" + "</td>";
                    html += "</tr>"
                } else {
                    html += "<tr>";
                    html += "<td class = \"capitalize bold\">" + k.replace(/_/g, " ") + "</td>";
                    html += "<td>" + (v == null ? "" : (v === true ? "Yes" : (v === false ? "No" : v))) + "</td>";
                    html += "</tr>"
                }
            });
            html += "</tbody></table>";
            return html;
        }

        makeSubjectSpecifiedHtmlTable (data) {
            // Should have a check here for good data.
            // Going to assume data is good.
            var html = "<table class = \"dataReturnTable\"><tbody>";
            $.each(data, function (index, datum) {
                html += "<tr><td class = \"noborder\">";
                html += "<table class = \"subjectBlock\"><tbody>";
                $.each(datum, function (k,v) {
                    html += "<tr class = \"subjectBlockRow\">";
                    html += "<td class = \"subjectBlockLabel capitalize bold\">" + k.replace(/_/g, " ") + "</td>";
                    html += "<td class = \"subjectBlockValue\">";
                    if (k == "course_id") {
                        html += "<a href = \"javascript:void(0)\" class = \"idOnclickLink\">" + v + "</a>";
                    } else if (k == "subject") {
                        html += "<a href = \"javascript:void(0)\" class = \"subjectOnclickLink\">" + v + "</a>";
                    } else {
                        html += v;
                    }
                    html += "</td></tr>";
                });
                html += "</tbody></table>";
                html += "</td></tr>";
            });
            html += "</tbody></table>";
            return html;
        }

        formatDataSliceHtml(data_slice) {
            var html = "";
            if (data_slice != null) {
                this.num_results = this.model.data.data.length;
                html += "<div class = \"results_fraction_box\">";
                html += "<a class = \"move_slice_left\" href = \"javascript:void(0)\"><</a>";
                html += "  results " + data_slice[0] + ".." + data_slice[1] + "  ";
                html += "<a class = \"move_slice_right\" href = \"javascript:void(0)\">></a>";
                html += "</div><div class = \"results_total_count_box\">";
                html += "of " + this.num_results + " results</div>"
            }
            return html;
        }
    }

	/*
		Function that will be called to start the app.
		Complete it with any additional initialization.
	*/
    exports.startApp = function() {
        var model = new AppModel();
        var view = new AppView(model, "div#viewContent");

        var formProcessFunction = function (event) {
            event.preventDefault();
            $('form#' + event.currentTarget.id + " .loader").show();
            var inputs = $('form#' + event.currentTarget.id + " :input");
            var values = {};
            inputs.each(function() {
                values[this.name] = $(this).val();
            });
            model.loadData(dataEndpoint, values);
        }

        $("form#dataFilterForm").submit(formProcessFunction);
        $("form#idSearchForm").submit(formProcessFunction);
        $('body').on('click', '.idOnclickLink', function (event) {
            $("form#idSearchForm .loader").show();
            var value = {courseid : event.target.innerText};
            model.loadData(dataEndpoint, value);
        });
        $('body').on('click', '.subjectOnclickLink', function (event) {
            $("form#dataFilterForm .loader").show();
            var value = {subject : event.target.innerText, catalognumber: ""};
            model.loadData(dataEndpoint, value);
        });
        $('body').on('click', '.move_slice_right', function (event) {
            $("form#dataFilterForm .loader").show();
            model.updateSlice("right");
            view.handleData();
        });
        $('body').on('click', '.move_slice_left', function (event) {
            $("form#dataFilterForm .loader").show();
            model.updateSlice("left");
            view.handleData();
        });
        setTabListeners();
    }



})(window);
