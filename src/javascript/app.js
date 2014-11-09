//console.log = function() {}

demo = {
    config: {
        dataUrl: "http://217.18.25.29:10070/",
        headers: function() {
            return {
            "Accept" : "application/json",
            "Content-Type" : "application/json",
            "sessionId" : demo.userAuthenticationModel.get("sessionId")
            }
        } 
    },
    router: Backbone.Router.extend({
        routes: {
            "":         "main",
            "signIn":    "signIn",
            "register":    "register",
            "userDetail":  "userDetail"
        },
        initialize: function() {

        },
        main: function() {
            demo.switchView(demo.mainView.el);
        },
        signIn: function() {
            demo.toggleMenu(demo.signInView.el);
        },
        register: function() {
            demo.toggleMenu(demo.registerView.el);
        },
        userDetail: function() {
            demo.switchView(demo.userDetailView.el);
        }
    }),
    channel: _.extend({}, Backbone.Events),
    loadModels: function() {
        demo.gameCollection = new demo.gameCollection();
        demo.registerNewUserModel = new demo.registerNewUserModel();
        demo.userModel = new demo.userModel();
        demo.userAuthenticationModel = new demo.userAuthenticationModel();
        demo.userDetailModel = new demo.userDetailModel();
        demo.userModel.set({authentication: demo.userAuthenticationModel, details: demo.userDetailModel});
        demo.signInModel = new demo.signInModel();
    },
    loadViews: function() {
        demo.mainView = new demo.mainView({collection: demo.gameCollection});
        demo.authenticationView = new demo.authenticationView({model: demo.userModel});
        demo.registerView = new demo.registerView({model: demo.registerNewUserModel});
        demo.signInView = new demo.signInView({model: demo.signInModel});
        demo.userDetailView = new demo.userDetailView({model: demo.userDetailModel});
    },
    init: function() {
        //console.log("Init demo app");

        this.loadModels();
        this.loadViews();

        demo.channel.on("reset", function() {
            //console.log("reset");
            demo.router.navigate("/", true);
        });

        demo.channel.on("attemptRegister", function() {
            //console.log("attempt register");  
            if (demo.router.routes[Backbone.history.fragment] == 'register') {
                demo.router.navigate("/", true);
            } else {
                demo.router.navigate("/register", true);
            }
        });

        demo.channel.on("attemptSignIn", function() {
            //console.log("attempt signIn");
            if (demo.router.routes[Backbone.history.fragment] == 'signIn') {
                demo.router.navigate("/", true);
            } else {
                demo.router.navigate("/signIn", true);
            }
        });

        demo.channel.on("signInSuccessful", function() {
            //console.log("signInSuccessful");
            demo.router.navigate("/", true);
            demo.userDetailView.loadUserDetails();
        });

        demo.channel.on("viewUserDetails", function() {
            //console.log("viewUserDetails");
            demo.router.navigate("/userDetail", true);
        });

        demo.channel.on("closeMenu", function() {
            //console.log("closeMenu");
            window.history.back();
        });

        demo.router = new demo.router();
        Backbone.history.start();
        demo.router.navigate('', true);
        demo.mainView.loadGameTitles();
    },
    switchView: function(nextView) {
        $("body").find(".active").removeClass("active");
        $(nextView).addClass("active");
    },
    toggleMenu: function(menu) {
        $("#menu").find(".menuPage").hide();
        $(menu).show();
        if ($("#menu").hasClass('active')) {
            $("#menu").removeClass('active');
        } else {
            $("#menu").addClass('active');
        }
    },
    displayFeedback: function(view, message, isError) {
        var messageClass = "feedback";
        if (isError) {
            messageClass = "error";
        }
        $(view).find(".errorPlaceholder").addClass(messageClass).html(message);
    },
    clearFeedback: function(view) {
        $(view).find(".error").removeClass("error");
        $(view).find(".feedback").removeClass("feedback");
    }
}

$(window).load(function() {
    demo.init();
});