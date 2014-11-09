demo.gameTitle = Backbone.Model.extend({
	url: function() {
		return demo.config.dataUrl + "profile/" + demo.userAuthenticationModel.get("userId") + "/titles/" + this.get("id");
	},
	defaults: {
		id: "",
		description: "",
		name: ""
	}
});

demo.gameCollection = Backbone.Collection.extend({
	url: demo.config.dataUrl + "gametitles/list",
	model: demo.gameTitle,
	parse: function(response) {
	    return response.titles;
	}
});

demo.userModel = Backbone.Model.extend({	
	initialize: function() {
		//console.log("Init userModel");
	}
});

demo.userAuthenticationModel = Backbone.Model.extend({	
	defaults: {
		expiryTime: null,
		sessionId: "",
		userId: ""
	},
	initialize: function() {
		//console.log("Init authenticatedUserModel");
	}
});

demo.registerNewUserModel = Backbone.Model.extend({
	url: function() {
		return demo.config.dataUrl + "register/" + this.get("username");
	},	
	defaults: {
		username: "",
		password: "",
	   	lastName: "",
	   	phoneNumber: "",
	   	firstName: ""
	},
	initialize: function() {
		//console.log("Init signInModel");
	},
    validate: function (attrs) {
    	var errors = [];
        if (!attrs.firstName) {
            errors.push({name: "firstName"});
        }
        if (!attrs.lastName) {
            errors.push({name: "lastName"});
        }
        if (!attrs.username) {
            errors.push({name: "username"});
        }
        if (!attrs.password) {
            errors.push({name: "password"});
        }
        if (!attrs.phoneNumber) {
            errors.push({name: "phoneNumber"});
        }
        return errors.length > 0 ? errors : false;
    }
});

demo.signInModel = Backbone.Model.extend({
	url: function() {
		return demo.config.dataUrl + "signin/" + this.get("username") + "/" + this.get("password");
	},	
	defaults: {
		username: "",
		password: ""
	},
	initialize: function() {
		//console.log("Init signInModel");
	},
    validate: function (attrs) {
    	var errors = [];
        if (!attrs.username) {
            errors.push({name: "username", message: "Please fill username field."});
        }
        if (!attrs.password) {
            errors.push({name: "password", message: "Please fill password field."});
        }
        return errors.length > 0 ? errors : false;
    }
});

demo.userDetailModel = Backbone.Model.extend({
	url: function() {
		return demo.config.dataUrl + "profile/" + demo.userAuthenticationModel.get("userId");
	},
	defaults: {
	   lastName: "",
	   username: "",
	   phoneNumber: "",
	   userId: "",
	   age: "",
	   genderIsFemale: "",
	   notes: "",
	   firstName: "",
	   password: ""
	},
	initialize: function() {
		//console.log("Init userDetailModel with userId " + demo.userAuthenticationModel.get("userId"));
	},
    validate: function (attrs) {
    	var errors = [];
        if (!attrs.firstName) {
            errors.push({name: "firstName"});
        }
        if (!attrs.lastName) {
            errors.push({name: "lastName"});
        }
        if (!attrs.username) {
            errors.push({name: "username"});
        }
        if (!attrs.password) {
            errors.push({name: "password"});
        }
        if (!attrs.phoneNumber) {
            errors.push({name: "phoneNumber"});
        }
        if (!attrs.age) {
            errors.push({name: "age"});
        }
        return errors.length > 0 ? errors : false;
    },
	parse: function(response) {
		// save response from server is {"status":"updated","userId":"a3f69887-ab13-4a81-a4b9-9776913cc5c1"}??
		if (response.status) {
			delete response.status;
		}
	    return response;
	}
});

demo.userGameCollection = Backbone.Collection.extend({
	url: function() {
		return demo.config.dataUrl + "profile/" + demo.userAuthenticationModel.get("userId") + "/titles";
	},
	model: demo.gameTitle,
	parse: function(response) {
	    return response.titles;
	}
});