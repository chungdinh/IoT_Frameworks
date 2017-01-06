/*
 - Client ws websocket 
*/

$(function () {
    "use strict";

    // for better performance - to avoid searching in DOM
    var content = $('#content');
    var status = $('#status');

    // my color assigned by the server
    var myColor = false;
    // my name sent to the server
    var myName = false;

    // if user is running mozilla then use it's built-in WebSocket
    window.WebSocket = window.WebSocket || window.MozWebSocket;

    // if browser doesn't support WebSocket, just show some notification and exit
    if (!window.WebSocket) {
        content.html($('<p>', { text: 'Sorry, but your browser doesn\'t '
                                    + 'support WebSockets.'} ));
        $('span').hide();
        return;
    }

    // open connection
    var connection = new WebSocket('ws://10.0.0.12:4348/measures');

    connection.onopen = 
	function()
	{
        // first we want users to enter their names
        status.text('Connected');
    };

    connection.onerror = 
	function(error) 
	{
        // just in there were some problems with conenction...
        content.html($('<p>', { text: 'Sorry, but there\'s some problem with your '
                                    + 'connection or the server is down.' } ));
    };

    // most important part - incoming messages
    connection.onmessage = 
	function(message)
	{
        try 
		{
            var json = JSON.parse(message.data);
        } catch (e) 
		{
            console.log('This doesn\'t look like a valid JSON: ', message.data);
            return;
        }
		
		var message_text = '';
		for (var key in json) 
		{
			message_text += key + " : <br>";
			for(var sk in json[key])
			{
				message_text += sk + '(' + json[key][sk].Value + ' : ' + json[key][sk].Time + ')<br>';
				if(sk == "Pressure")
				{
					var value = Math.round(json[key]["Pressure"].Value);
					ChartSetPressureValue(key,value);
				}
				if(sk == "Temperature")
				{
					var value = Math.round(100*json[key]["Temperature"].Value)/100;
					console.log("Temperature",key,value);
					ChartSetTemperatureValue(key,value);
				}
			}
			//message_text += '<br>';
		}
		
		addMessage(message_text);
		console.log('received ', json);
    };

    /**
     * This method is optional. If the server wasn't able to respond to the
     * in 3 seconds then show some error message to notify the user that
     * something is wrong.
     */
    setInterval(
		function()
		{
			if (connection.readyState !== 1) 
			{
				status.text('Error');
			}
		}
		, 3000);

    /**
     * Add message to the chat window
     */
    function addMessage(message) {
        //content.prepend('<p>' + message + '</p>');
		content.html('<p>' + message + '</p>');
    }
});