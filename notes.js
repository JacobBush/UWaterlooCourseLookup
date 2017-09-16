/*
 *  Starter code for University of Waterloo CS349 - Spring 2017 - A3.
 *	Refer to the JS examples shown in lecture for further reference.
 *  Note: this code uses ECMAScript 6.
 *  Updated 2017-07-12.
 */
	
"use strict";

(function(exports) {

	/* A Model class */
    class AppModel {
		constructor() {
			this._observers = [];
            if (typeof(Storage) !== "undefined") {
                this.storage = localStorage;
                if (this.storage.notesCounter == null) {
                    this.storage.setItem("notesCounter", 0);
                }
            } else {
            }
		}

        createNote (data) {
            var d = new Date();
            var note = {};
            note.title = data.note_title;
            note.body = data.note_body;
            note.timestamp = d.getTime();
            this.storeLocally(note);
            this.notify();
        }

        deleteNote (note) {
            this.storage.removeItem(note);
            this.notify();
        }

        storeLocally(obj) {
            obj.id = this.storage.notesCounter;
            this.storage.setItem("note" + this.storage.notesCounter, JSON.stringify(obj));
            this.storage.setItem("notesCounter", parseInt(this.storage.notesCounter) + 1);
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
            $('form#noteCreationForm .clearable').val("");
            var noteDisplayBlockHtml = "";
            if (this.model.storage != null) {
                var that = this;
                $.each(this.model.storage, function (k,v) {
                    if (k.substring(0,4) == "note" && $.isNumeric(k.substring(4,5))) {
                        var note = JSON.parse(v);
                        noteDisplayBlockHtml += that.createNoteHtml(note);
                    }
                });
            }
            $("#noteDisplayBlock").html(noteDisplayBlockHtml);
        }

        createNoteHtml(note) {
            var html = "<div class = \"noteBlock\">";
            html += "<div class = \"noteDeleteButton\">&#10006;</div>";
            html += "<div class = \"noteTitle\">" + note.title + "</div>";
            var date = new Date(note.timestamp);
            html += "<div class = \"noteTimestamp\">" + date.toString() + "</div>";
            html += "<div class = \"noteIdBlock\">ID: <div class = \"noteId\">" + note.id + "</div></div>";
            html += "<div class = \"noteBody\">" + note.body.replace(/\n/g, "<br />") + "</div>";
            html += "</div>"
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

        $("form#noteCreationForm").submit(function (event) {
            event.preventDefault();
            var values = {};
            $('form#noteCreationForm :input').each(function() {
                values[this.name] = $(this).val();
            });
            model.createNote(values);
        });

        $("body").on('click', ".noteDeleteButton", function(event) {
            if (confirm("Are you sure you wish to delete this note? This cannot be undone.")) {
                var noteName = "note" + $(event.target).parent().find(".noteId").html();
                model.deleteNote(noteName);
            }
        }); 

        setTabListeners();
    }



})(window);
