Documentatie API Ticketing System :

Backend-ul aplicatiei Ticketing System este realizat in totalitate "serverless" - se bazeaza pe un API pentru a opera datele utilizatorilor. Principalele servicii folosite sunt :
* AWS Cognito : pentru autentificare si autorizarea usererilor
* AWS API Gateway : joaca rolul endpoint-ului care primeste si autentifica request-urile venite spre a fi procesate de API
* AWS Lambda : functii AWS Lambda ce contin logica efectiva de tratare a requesturilor .

Toate requesturile catre API trebuie sa contina headerul `Authorization : "cognito-token"`, unde `cognito-token`reprezinta valoarea tokenului primit de la serviciul de autentificare Cognito (vezi codul ce apeleaza API-uri de pe front-end pentru a vedea cum se poate obtine acest token).

Organizarea API-ului:

* /tickets :
  * GET :
     * Returneaza o lista de tichete (in format JSON) accesibile de user-ul ce face requestul.
     * Returneaza si tichetele accesibile pentru grupurile din care utilizatorul face parte
  * POST :
  	 * Folosit pentru a adauga un nou ticket la baza de date
  	 * In body trebuie sa contina un JSON ce reprezinta ticketul ce va fi adaugat in baza de date.
* /tickets/{ticketId} :
	* GET :
		* Returneaza detalii despre ticketul cu id-ul {ticketId}
		* Verifica daca userul are acces la tichetul respectiv. Daca nu, intoarce 403.
	* POST :
		* Folosit pentru a updata fielduri din ticket. Body-ul trebuie sa fie un JSON cu care va fi updatat ticket-ul cu id = {ticketId}.
		* Verifica accesul userului la ticket
		* Orice field din body va updata/ crea un nou field in ticketul respectiv.
* /replies/{ticketId} :
	* GET :
		* Returneaza o lista cu cu reply-urile de pe thread-ul ticketului cu id = {ticketId}
		* Verifica accesul userului la ticket
	* POST :
		* Adauga un nou reply la thread-ul ticketului curent. 
		* Verifica accesul userului la ticket
* /access/{ticketId} :
	* GET : 
		* Returneaza o lista de identificatori ai userilor / grupurilor care au acces la ticket.
		* Verifica accesul userului la ticket
	* PUT : 
		* Modifica tabela de acces la ticket (poate adauga sau elimina identificatori (useri sau grupuri))
		* Verifica accesul userului la ticket

Tabele DynamoDB folosite:

* Groups : Retine o mapare intre useri si grupurile din care acestia fac parte (in forma de perechi (username - group))
* Replies : retine reply-urile pentru fiecare ticket (identificate prin cheia primara ticketId - data)
* Tickets : retine detalii despre tickete (cheia primara este ticketId)
	* Mentiune importanta : Aceasta table poate stoca orice fel de JSON, astfel incat API-ul este flexibil in ceea ce priveste field-urile pe care le necesita
* TicketsAccess: retine informatii despre controlul accesului la tickete, in forma (username - ticketId)
