(function ($) {
    "use strict";

    /*==================================================================
    [ Focus Contact2 ]*/
    $('.input100').each(function(){
        $(this).on('blur', function(){
            if($(this).val().trim() != "") {
                $(this).addClass('has-val');
            }
            else {
                $(this).removeClass('has-val');
            }
        })    
    })

    /*==================================================================
    [ Validate ]*/
    var input = $('.validate-input .input100');

    $('.validate-form').on('submit',function(){
        var check = true;

        for(var i=0; i<input.length; i++) {
            if(validate(input[i]) == false){
                showValidate(input[i]);
                check=false;
            }
        }
        if(check === true){
            prepare_ticket_data();
        }
        return false;
    });


    $('.validate-form .input100').each(function(){
        $(this).focus(function(){
           hideValidate(this);
        });
    });

    function validate (input) {
        if($(input).attr('type') == 'email' || $(input).attr('name') == 'email') {
            if($(input).val().trim().match(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{1,5}|[0-9]{1,3})(\]?)$/) == null) {
                return false;
            }
        }
        else {
            if($(input).val().trim() == ''){
                return false;
            }
        }
    }

    function showValidate(input) {
        var thisAlert = $(input).parent();

        $(thisAlert).addClass('alert-validate');
    }

    function hideValidate(input) {
        var thisAlert = $(input).parent();

        $(thisAlert).removeClass('alert-validate');
    }
    

})(jQuery);

var files = []
function prepare_ticket_data(){
    values = {}
    $('.input100').each(function(){
        values[$(this).attr('name')] = $(this).val()
   })
    values['priority'] = $('.select100').find(":selected").text();
    console.log(values);
    send_ticket_data(values,files).then((data) => {
        console.log("Finished");
        setTimeout(3000, () => {window.location.replace('tickets.html')})
    });
}

 $('#file-upload').bind('change', function() { 
 	var fileName = $(this).val();
 	fileName = fileName.substring(fileName.lastIndexOf("\\") + 1, fileName.length);
 	var span = $('<div />\n').addClass('span-filename').html(fileName);
 	$('#container-selected-files').append(span);
 	var file = $('#file-upload').prop('files')[0];
 	if(file != undefined)
 		files.push(file);
 })


// BACKEND
// -------------------------------------------------------------------------------------------------
 function send_ticket_data(values, files){
    console.log("Send ticket data called");
    var endpoint = _config.api.invokeUrl + "/tickets";
    var method = "POST";
    var token;
    return WildRydes.authToken
        .then((data) => {token = data} )
        .catch((err) => {console.log("Got an error while getting the token  " +err)})
        .then((data) => {
        //    Now make the call to the api
            return $.ajax({
                method: method,
                url: endpoint,
                headers: {
                    Authorization: token,
                    "Access-Control-Allow-Origin" : "*"
                },
                data: JSON.stringify(values),
                contentType: 'application/json'
            });
        }).catch((err) => {console.log("got an error when adding the ticket " + err)})
    //values represent a dictionary where key=field name, and dic[key]= data from the field
    //files represents the name of the files, not the actually BLOB files
    //most probably the files part will represent a feature
 }