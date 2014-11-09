demo.mainView = Backbone.View.extend({
	el: "#main",
	template: _.template($.ajax({ type:'GET', url:'templates/main.html', async:false }).responseText),
	initialize: function() {
		//console.log("Init mainView");
	},
	events: {

	},
	render: function() {
		//console.log("Render mainView");
		this.$el.html(this.template({titles: this.collection.toJSON()}));
		return this;
	},
	loadGameTitles: function() {
		var _thisView = this;
		this.collection.fetch({
			headers: {
				"Accept" : "application/json",
				"Content-Type" : "application/json"
			},
		}).done(function(data) {
			//console.log(["title success: ", data]);
			_thisView.render();
		});
	}
});

demo.authenticationView = Backbone.View.extend({
	el: "#authentication",
	template: _.template($.ajax({ type:'GET', url:'templates/authentication.html', async:false }).responseText),
	initialize: function() {
		//console.log("Init authenticationView");
		this.listenTo(this.model.get("authentication"), 'change', this.render);
		this.listenTo(this.model.get("details"), 'change', this.render);
		this.render();
	},
	events: {
		"click #signIn": "signIn",
		"click #signOut": "signOut",
		"click #register": "register",
		"click a": "viewDetails"
	},
	render: function() {
		//console.log("Render authenticationView");
		this.$el.html(this.template({
			authentication: this.model.get("authentication").toJSON(), 
			details: this.model.get("details").toJSON()
		}));
		return this;
	},
	userSignedIn: function() {
		//console.log("user signed in");
	},
	signIn: function() {
		demo.channel.trigger("attemptSignIn");
	},
	signOut: function() {
		this.model.get("authentication").clear();
		this.model.get("details").clear({silent: true});
		demo.channel.trigger("reset");
	},
	viewDetails: function(event) {
		event.preventDefault();
		demo.channel.trigger("viewUserDetails");
	},
	register: function() {
		demo.channel.trigger("attemptRegister");
	}
});

demo.registerView = Backbone.View.extend({
	el: "#registerPage",
	template: _.template($.ajax({ type:'GET', url:'templates/register.html', async:false }).responseText),
	initialize: function() {
		this.formValues = {};
		this.render();
	},
    events: {
    	"change input": "valueChanged",
        "click button.submit": "validateForm",
        "click button.goBack": "closeMenu",
        "click .overlay": "closeMenu"
	},
	render: function() {
		this.$el.html(this.template);
	},
	valueChanged: function(event) {
		var input = $(event.currentTarget);
		var attributeName = input.attr("name");
		attributeName = attributeName.substring(attributeName.indexOf("-") + 1);
		this.formValues[attributeName] = input.val();
	},
	validateForm: function(event) {
		event.preventDefault();
        this.clearErrors();
        this.model.set(this.formValues);
        if (!this.model.isValid()) {
        	this.handleErrors(this.model.validationError);
        } else {
        	this.register(this.formValues);
        }
	},
	handleErrors: function(errors) {
		_.each(errors, function(error) {
			var inputGroup = this.$el.find("input[name=register-" + error.name + "]").parent().addClass("error");
		}, this);
	},	
	clearErrors: function() {
		this.$(".error").removeClass("error");
	},
	register: function(formValues) {
		//console.log("submitLogin");
		var _thisView = this;
		this.model.save({}, {
			type: "put",
			headers: {
				"Accept" : "application/json",
				"Content-Type" : "application/json"
			},
			error: function(model, xhr, options) {
				var errorMessage = "Error " + xhr.status + ": " + xhr.statusText;
	      		//console.log("Error " + xhr.status + ": " + xhr.statusText);   
	      		demo.displayFeedback(_thisView.el, errorMessage, true);
	    	}
		}).done(function(data) {
			//console.log(["signin success: ", data]);
			demo.displayFeedback(_thisView.el, "Successfully registered.", false);
			_thisView.$el.find("input").attr('disabled','disabled');
			_thisView.$el.find("button.submit").attr('disabled','disabled');
		});
	},
	closeMenu: function(event) {
		event.preventDefault();
		demo.channel.trigger("closeMenu");
	}
});

demo.signInView = Backbone.View.extend({
	el: "#signInPage",
	template: _.template($.ajax({ type:'GET', url:'templates/login.html', async:false }).responseText),
	initialize: function() {
		//console.log("Init signinView");
		this.listenTo(this.model, 'change:expiryTime', this.render);
		this.formValues = {};
		this.render();
	},
    events: {
    	"change input": "valueChanged",
        "click button.submit": "validateForm",
        "click button.cancel": "closeMenu",
        "click .overlay": "closeMenu"
    },
	render: function() {
		//console.log("Render signinView");
		this.$el.html(this.template(this.model.toJSON()));
		return this;
	},
	valueChanged: function(event) {
		var input = $(event.currentTarget);
		var attributeName = input.attr("name");
		attributeName = attributeName.substring(attributeName.indexOf("-") + 1);
		this.formValues[attributeName] = input.val();
	},
	validateForm: function(event) {
		event.preventDefault();
        this.clearErrors();
        this.model.set(this.formValues);
        if (!this.model.isValid()) {
        	this.handleErrors(this.model.validationError);
        } else {
        	this.submitLogin(this.formValues);
        }
	},
	handleErrors: function(errors) {
		_.each(errors, function(error) {
			var inputGroup = this.$el.find("input[name=login-" + error.name + "]").parent().addClass("error");
		}, this);
	},	
	clearErrors: function() {
		this.$(".error").removeClass("error");
	},
	submitLogin: function(formValues) {
		//console.log("submitLogin");
		var _thisView = this;
		this.model.fetch({
			headers: {
				"Accept" : "application/json",
				"Content-Type" : "application/json"
			},
			error: function(model, xhr, options) {
				var errorMessage = "Error " + xhr.status + ": " + xhr.statusText;
	      		//console.log("Error " + xhr.status + ": " + xhr.statusText);   
	      		demo.displayFeedback(_thisView.el, errorMessage, true);
	    	}
		}).done(function(data) {
			//console.log(["signin success: ", data]);
			demo.userAuthenticationModel.set(data);
			demo.channel.trigger("signInSuccessful");
		});
	},
	closeMenu: function(event) {
		event.preventDefault();
		demo.channel.trigger("closeMenu");
	}
});

demo.userDetailView = Backbone.View.extend({
	el: "#userDetail",
	template: _.template($.ajax({ type:'GET', url:'templates/userDetail.html', async:false }).responseText),
	initialize: function() {
		//console.log("Init userDetailView");
		this.listenTo(this.model, 'change', this.refreshView);
		this.formValues = {};
	    this.render();
	},
    events: {
    	"change input": "valueChanged",
    	"change textarea": "valueChanged",
        "click .updateDetails": "validateForm"
    },
	render: function() {
		//console.log("Render userDetailView");
		this.$el.html(this.template(this.model.toJSON()));
		return this;
	},
	refreshView: function() {
		this.render();
		this.loadUserTitles();
	},
	loadUserDetails: function() {
		var _thisView = this;
		this.model.fetch({
			headers: demo.config.headers()
		}).done(function(data) {
			_thisView.refreshView();
		});
	},
	valueChanged: function(event) {
		var input = $(event.currentTarget);
		if (input.attr("type") == "radio") {
			var boolValue = input.val() == "true" ? true : false;
			this.formValues[input.attr("name")] = boolValue;
		} else {
			this.formValues[input.attr("name")] = input.val();
		}
	},
	clearErrors: function() {
		this.$(".error").removeClass("error");
	},
	handleErrors: function(errors) {
		_.each(errors, function(error) {
			var inputGroup = this.$el.find("input[name=" + error.name + "]").parent().addClass("error");
		}, this);
	},
	validateForm: function(event) {
		event.preventDefault();
		this.clearErrors();
		demo.clearFeedback();
		this.model.set(this.formValues);
        if (!this.model.isValid()) {
        	this.handleErrors(this.model.validationError);
        } else {
        	this.updateDetails();
        }
	},
	updateDetails: function() {
		var _thisView = this;
		this.model.save({}, 
			{ 
				type: "put",
				headers: demo.config.headers(),
				error: function(model, xhr, options) {
					var errorMessage = "Error " + xhr.status + ": " + xhr.statusText;
		      		//console.log("Error " + xhr.status + ": " + xhr.statusText);   
		      		demo.displayFeedback(_thisView.el, errorMessage, true);
		    	},
				success: function(model, xhr, options) {
					var message = "User details updated successfully";
		      		//console.log(message);   
		      		_thisView.refreshView();
		      		demo.displayFeedback(_thisView.el, message, false);
		    	}
			}
		);
	},
	loadUserTitles: function() {
		this.titlesView = new demo.userTitlesView({collection: new demo.userGameCollection()});
		this.titlesView.setElement(this.$el.find("#titlesContainer")).render();
	}
});

demo.userTitlesView = Backbone.View.extend({
	el: "#titlesContainer",
	template: _.template($.ajax({ type:'GET', url:'templates/userTitles.html', async:false }).responseText),
	initialize: function() {
		//console.log("Init userTitlesView");
		_.bindAll(this, 'render');
		this.listenTo(this.collection, 'remove', this.removeTitle);
		this.availableTitles = demo.gameCollection;
		this.selectedNewModel = {};
		this.getUserTitles();
	},
	events: {
		"change select": "prepareToAddModel",
		"click .addTitle": "addTitle"
	},
	render: function() {
		//console.log("Render userTitlesView");
		this.$el.html(this.template({availableTitles: this.availableTitles.toJSON()}));
		this.collection.each(function(title){
			var childView = new demo.userTitle({model: title});
			this.$el.find("ul").append(childView.render().$el);
		}, this);
		return this;
	},
	getUserTitles: function() {
		var _thisView = this;
		this.collection.fetch({
			headers: demo.config.headers()
		}).done(function(data) {
			//console.log(data); 
			_thisView.render();
			_thisView.listenTo(_thisView.collection, 'add', _thisView.render);
		});		
	},
	prepareToAddModel: function(event) {
		//console.log($(event.target).val());
		var newTitleId = $(event.target).val();
		this.selectedNewModel = this.availableTitles.findWhere({id: newTitleId});
		if (this.isTitleAlreadyListed(newTitleId) || this.selectedNewModel == undefined) {
			this.$el.find(".addTitle").attr('disabled','disabled');
		} else {
			this.$el.find(".addTitle").removeAttr('disabled');
		}		
	},
	isTitleAlreadyListed: function(modelId) {
		return this.collection.findWhere({id: modelId}) != undefined;
	},
	addTitle: function(event) {
		event.preventDefault();
		var _thisView = this;
		this.collection.create(this.selectedNewModel, {
			wait: true,
			headers: demo.config.headers(),
			success: function(model, xhr, options) {
				//console.log("Title added");
				var message = "New title added successfully";
				demo.displayFeedback(_thisView.el, message, false);
			},
			error: function(model, xhr, options) {
				var errorMessage = "Error " + xhr.status + ": " + xhr.statusText;  
	      		demo.displayFeedback(_thisView.el, errorMessage, true);
			}
		});
	},
	removeTitle: function() {
		var message = "Title removed successfully";
		demo.displayFeedback(this.el, message, false);
		//this.render();
	}
});

demo.userTitle = Backbone.View.extend({
	tagName: "li",
	template: _.template($.ajax({ type:'GET', url:'templates/userTitle.html', async:false }).responseText),
	initialize: function(options) {
		//console.log("Init userTitleView");
        _.bindAll(this, 'render');
	},
	events: {
		"click button": "removeTitle"
	},
	render: function() {
		//console.log("Render userTitleView");
		this.$el.append(this.template(this.model.toJSON()));
		return this;
	},
	removeTitle: function(event) {
		//console.log("remove title")
		this.model.destroy({
			headers: demo.config.headers(),
			success: function(response) {
				console.log("Title removed");
			}
		});
		this.$el.remove();
	}
});