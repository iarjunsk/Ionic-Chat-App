angular.module('app.services', [])

.factory('ChatDetails', ['sharedConn','$rootScope', function(sharedConn,$rootScope){
	ChatDetailsObj={};
	
	ChatDetailsObj.setTo = function(to_id){
		ChatDetailsObj.to=to_id;
	}
	ChatDetailsObj.getTo = function(){
		return ChatDetailsObj.to;
	}
	
	return ChatDetailsObj;	
}])

.factory('Chats', ['sharedConn','$rootScope','$state', function(sharedConn,$rootScope,$state){
	
	ChatsObj={};
	
	connection=sharedConn.getConnectObj();
	ChatsObj.roster=[];

	loadRoster= function() {
			var iq = $iq({type: 'get'}).c('query', {xmlns: 'jabber:iq:roster'});
				
				connection.sendIQ(iq, 
					//On recieve roster iq
					function(iq) {
						
						console.log(iq);
						
						if (!iq || iq.length == 0)
							return;
						
						//jquery load data after loading the page.This function updates data after jQuery loading
						$rootScope.$apply(function() {
							
							$(iq).find("item").each(function(){
								
								ChatsObj.roster.push({
									id: $(this).attr("jid"),
									name:  $(this).attr("name") || $(this).attr("jid"),
									lastText: 'Available to Chat',
									face: 'img/ben.png'
								});
				
							});						
						
						});	
							
					});
					// set up presence handler and send initial presence
					connection.addHandler(
						//on recieve precence iq
						function (presence){		
						   /*var presence_type = $(presence).attr('type'); // unavailable, subscribed, etc...
						   var from = $(presence).attr('from'); // the jabber_id of the contact
						   if (presence_type != 'error'){
							 if (presence_type === 'unavailable'){
								console.log("offline"); //alert('offline');
							 }else{
							   var show = $(presence).find("show").text(); // this is what gives away, dnd, etc.
							   if (show === 'chat' || show === ''){
								 console.log("online"); //alert('online');
							   }else{
								 console.log("etc");//alert('etc');
							   }
							 }
						   }
						   */
						   return true;
						}
					, null, "presence");
					
					connection.send($pres());		
			
					connection.addHandler(
						//on recieve update roster iq
						function(iq) {
							
							console.log(iq);
							
							if (!iq || iq.length == 0)
								return;
							
							//jquery load data after loading the page.This function updates data after jQuery loading
							$rootScope.$apply(function() {
								
								$(iq).find("item").each(function(){
									
									//roster update via Client 1(ie this client) accepting request
									if($(this).attr("subscription")=="from"){
										
										ChatsObj.roster.push({
											id: $(this).attr("jid"),
											name:  $(this).attr("name") || $(this).attr("jid"),
											lastText: 'Available to Chat',
											face: 'img/ben.png'
										});
									}
									// Waiting for the Client 2 to accept the request
									else if ( $(this).attr("subscription")=="none"  && $(this).attr("ask")=="subscribe" ){
										
										ChatsObj.roster.push({
											id: $(this).attr("jid"),
											name:  $(this).attr("name") || $(this).attr("jid"),
											lastText: 'Waiting to Accept',
											face: 'img/ben.png'
										});
										
										
									}

									//roster update via Client 2 deleting the roster contact
									else if($(this).attr("subscription")=="none"){ 
										console.log( $(this).attr("jid")  );
										ChatsObj.removeRoster( ChatsObj.getRoster( $(this).attr("jid") ) );
									}
									
								});
								$state.go('tabsController.chats', {}, {location: "replace", reload: true});
							
							});	
								
						}

					,"jabber:iq:roster", "iq", "set");
									
		
					return ChatsObj.roster;
					
	}	
				
 

	ChatsObj.allRoster= function() {
		loadRoster();
		return ChatsObj.roster;
	}
 
 

	ChatsObj.removeRoster= function(chat) {
		ChatsObj.roster.splice(ChatsObj.roster.indexOf(chat), 1);
	}

	ChatsObj.getRoster= function(chatId) {
		for (var i = 0; i < ChatsObj.roster.length; i++) {
			if (ChatsObj.roster[i].id == chatId) {
			  return ChatsObj.roster[i];
			}
		  }
	}
	
	
	ChatsObj.addNewRosterContact=function(to_id){
		console.log(to_id);
		connection.send($pres({ to: to_id , type: "subscribe" }));		
	}
		
	
	return ChatsObj;
  

}])




.factory('sharedConn', ['$ionicPopup','$state','$rootScope','$ionicPopup',function($ionicPopup,$state, $rootScope , $ionicPopup ){
	
	 var SharedConnObj={};
	
	 SharedConnObj.BOSH_SERVICE = 'http://xvamp:7070/http-bind/';  
	 SharedConnObj.connection   = null;    // The main Strophe connection object.
	 SharedConnObj.loggedIn=false;
	 

	 //------------------------------------------HELPER FUNCTIONS---------------------------------------------------------------
	 SharedConnObj.getConnectObj=function(){
			return SharedConnObj.connection; 
	 };
	  
	 SharedConnObj.isLoggedIn=function(){
			return SharedConnObj.loggedIn; 
	 };
	 
	 SharedConnObj.getBareJid=function(){	
		var str=SharedConnObj.connection.jid;
		str=str.substring(0, str.indexOf('/'));
        return str;
     };
		 
		 
	 
	 //--------------------------------------***END HELPER FUNCTIONS***----------------------------------------------------------
	 	
	//Login Function
	SharedConnObj.login=function (jid,host,pass) {	 
		SharedConnObj.connection = new Strophe.Connection( SharedConnObj.BOSH_SERVICE , {'keepalive': true});  // We initialize the Strophe connection.
		SharedConnObj.connection.connect(jid+'@'+host, pass , SharedConnObj.onConnect);
	};
	
	//On connect XMPP
	SharedConnObj.onConnect=function(status){
		if (status == Strophe.Status.CONNECTING) {
			console.log('Strophe is connecting.');
		} else if (status == Strophe.Status.CONNFAIL) {
			console.log('Strophe failed to connect.');
		} else if (status == Strophe.Status.DISCONNECTING) {
			console.log('Strophe is disconnecting.');
		} else if (status == Strophe.Status.DISCONNECTED) {
			console.log('Strophe is disconnected.');
		} else if (status == Strophe.Status.CONNECTED) {		
				SharedConnObj.connection.addHandler(SharedConnObj.onMessage, null, 'message', null, null ,null);
				SharedConnObj.connection.send($pres().tree());
				SharedConnObj.loggedIn=true;
				
				SharedConnObj.connection.addHandler(SharedConnObj.on_subscription_request, null, "presence", "subscribe");
				
				$state.go('tabsController.chats', {}, {location: "replace", reload: true});
		}
	};

	
	//When a new message is recieved
	SharedConnObj.onMessage=function(msg){
		$rootScope.$broadcast('msgRecievedBroadcast', msg );
		return true;
	};
	
	SharedConnObj.register=function (jid,pass,name) {
		//to add register function
	};
	
	SharedConnObj.logout=function () {
		console.log("reached");
		SharedConnObj.connection.options.sync = true; // Switch to using synchronous requests since this is typically called onUnload.
		SharedConnObj.connection.flush();
		SharedConnObj.connection.disconnect();
	};
	
	//Helper Function------------------------------
	var accepted_map={};  //store all the accpeted jid
	function is_element_map(jid){
		if (jid in accepted_map) {return true;} 
		else {return false;}	
	}
	function push_map(jid){
		accepted_map[jid]=true;
	}
	//--------------------------------------------
	
	
	SharedConnObj.on_subscription_request = function(stanza){
		
		console.log(stanza);
		
		if(stanza.getAttribute("type") == "subscribe" && !is_element_map(stanza.getAttribute("from")) )
		{	
			
			//the friend request is recieved from Client 2
			var confirmPopup = $ionicPopup.confirm({
				 title: 'Confirm Friend Request!',
				 template: ' ' + stanza.getAttribute("from")+' wants to be your freind'
			});
			
		   confirmPopup.then(function(res) {
			 if(res) {
			   SharedConnObj.connection.send($pres({ to: stanza.getAttribute("from") , type: "subscribed" }));
			   
			   push_map( stanza.getAttribute("from") ); //helper
			 } else {
			   SharedConnObj.connection.send($pres({ to: stanza.getAttribute("from") , type: "unsubscribed" }));
			 }
		   });
			   
			return true;
		}

	}



	
	
	return SharedConnObj;
}])



.service('BlankService', [function(){

}]);

