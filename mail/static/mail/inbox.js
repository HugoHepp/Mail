document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);



  

  // Send email function 
  document.querySelector("#compose-form").addEventListener("submit", function (event) {
    event.preventDefault();
    fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
          recipients: document.querySelector('#compose-recipients').value,
          subject: document.querySelector('#compose-subject').value,
          body: document.querySelector('#compose-body').value
      })
    })
    .then(response => response.json())
    .then(result => {
        // back to inbox page
        load_mailbox('inbox');
    })

  })
  load_mailbox('inbox');
});



// Load compose view 
function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#emailopen-view').style.display = 'none';
  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

}

// Load mailbox
function load_mailbox(mailbox) {

	// empty the view
	document.querySelector('#emails-view').innerHTML = ""
  	  // Insert title of mailbox
	  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
	  // Load mail into mailbox
	  fetch('/emails/' + mailbox)
		.then(response => response.json())
		.then(emails => {
		    emails.forEach(element => {
		    	// Create div for each mail 
		    	link = document.createElement("div");
		    	link.setAttribute("id", "link");
		    	// Create link to mail on click
		    	mail = document.createElement("div");
		    	mail.addEventListener("click", () => loadmail(element.id)); 
		    	// Choose CSS for read or unread mail
		    	if (element.read == true || mailbox == "sent") {
			    	link.className = "mail_read";
			    }
		    	else
		    	{
		    		link.className = "mail_unread";
		    	}
		    	// Display information of mail
		    	mail.innerHTML =  "From: " + element.sender + "<br>" + 
		    					  "Subject: " + element.subject + "<br>"+
		    					  "Date: " + element.timestamp + "<br>";

		    	mail.setAttribute("style","width : 500px;")


		    	// Create buttons for reply, archive and unarchived according to page
		    	if (mailbox != "sent") {
		    		button_reply = document.createElement("BUTTON");
			    	button_reply.setAttribute("style","margin:7px; margin-top: 25px;float:right;")
			    	button_reply.innerHTML = "Reply";
			    	button_reply.className = "btn btn-dark btn-sm"
			    	button_reply.addEventListener('click', () => reply_get(element.id))
			    	link.append(button_reply);
		    	}
		    	if (mailbox == "inbox") {
		    		button_archive = document.createElement("BUTTON")
		    		button_archive.setAttribute("style","margin:7px; margin-top: 25px; float:right;")
		    		button_archive.className = "btn btn-dark btn-sm"
		    		button_archive.innerHTML = "Archive"
		    		link.append(button_archive)
		    		button_archive.addEventListener("click", () => archive_mail(element.id)); 
		    	}
		    	if (mailbox == "archive") {
		    		button_unarchive = document.createElement("BUTTON")
		    		button_unarchive.setAttribute("style","margin:7px; margin-top: 25px; float:right;")
		    		button_unarchive.innerHTML = "Unarchive"
		    		button_unarchive.className = "btn btn-dark btn-sm"
		    		link.append(button_unarchive)
		    		button_unarchive.addEventListener("click", () => unarchive_mail(element.id)); 

		    	}
		    	// Add elements to DOM
		    	link.appendChild(mail);
		    	document.querySelector('#emails-view').append(link);
		    	});
		    	
		const element = document.createElement('emails-view');

		});

	  //Display emailview and hide other views
	  document.querySelector('#emails-view').style.display = 'block';
	  document.querySelector('#compose-view').style.display = 'none';
	  document.querySelector('#emailopen-view').style.display = 'none';
}


function loadmail(mail_id){
	// Set mail to read
	fetch('/emails/' + mail_id, {
	  method: 'PUT',
	  body: JSON.stringify({
	      read: true
	  })
	})
	// Display mail 	
	fetch('/emails/' + mail_id)
	.then(response => response.json())
	.then(emails => {
	    // Print emails   
	    openmail = document.querySelector('#emailopen-view');
	    openmail.innerHTML =  "From: " + emails.sender + "<br>" + 
	    					  "Recipients: " + emails.recipients + "<br>" + 
	    					  "Subject: " + emails.subject + "<br>"+
	    					  "Date: " + emails.timestamp + "<br><hr>"+ 
	    					   emails.body + "<br>";
	    // Add reply button 					   
	    button_reply = document.createElement("BUTTON");
		    	button_reply.setAttribute("style", "margin: 15px 0px; padding-left:0px; padding-right:0px; float:left; ")
		    	button_reply.innerHTML = "Reply";
		    	button_reply.className = "btn btn-dark btn-sm"
		    	button_reply.addEventListener('click', () => reply_get(emails.id))
		    	openmail.append(button_reply);

	});
	// Display view
	document.querySelector('#emails-view').style.display = 'none';
	document.querySelector('#emailopen-view').style.display = 'block';
}	


 
function archive_mail(mail_id){

	// Set mail to archived
	fetch('/emails/' + mail_id, {
	  method: 'PUT',
	  body: JSON.stringify({
	      archived: true
	  })
	})	
	load_mailbox("inbox")
}



function unarchive_mail(mail_id){

	// Set mail to archived
	fetch('/emails/' + mail_id, {
	  method: 'PUT',
	  body: JSON.stringify({
	      archived: false
	  })
	})	
	load_mailbox("archive")

}



function reply_get(mail_id){

	// Get elements from compose view to pre-fill them
 	replybody = document.querySelector('#compose-body');
 	replyrecipients = document.querySelector('#compose-recipients')
 	replysubject = document.querySelector('#compose-subject')
 	replybody.innerHTML = "";

 	// Get infos from the mail to reply
 	fetch('/emails/' + mail_id)
	.then(response => response.json())
	.then(emails => { 
		var time = emails.timestamp;
		var sender = emails.sender;
		var body = emails.body;
		var subject = emails.subject;

		// Prefill form 
		replybody.innerHTML = "On " + time + ", " + sender + " wrote: " + '"' + body + '"';
		replyrecipients.setAttribute("value",sender);
		replysubject.setAttribute("value", "Re: " + subject );


	})

	// Display view
	document.querySelector('#emails-view').style.display = 'none';
	document.querySelector('#emailopen-view').style.display = 'none';
 	document.querySelector('#compose-view').style.display = 'block';
}

	


