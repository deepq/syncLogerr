---

#### What does it do?
Main purpose of this library is to log remotely browser javascript errors.
It is a fork of 'logerr' library originally made by Vaibhav Mehta <firekillz@gmail.com>
(<https://github.com/i-break-codes>)

The main differences from the original library are:
- additional fields in log object (browser type, screen parameters, etc)
- background sync of errors as batches
- send error format 'json'

---

#### Install:


#### [npm](http://npmjs.com)

#### [Bower](https://bower.io/)

#### Manually

Download `syncLogerr.js` and follow the setup instructions below.

---

#### Setup
Just include `syncLogerr.js` file and the `init()` i.e initializer in the `<head>` section of your page, before you include any other JavaScript. `init()` will initialize the lib, where later you can pass an object to customize.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <script src="syncLogerr.js"></script>
	<script>
	  Logerr.init();
	</script>
  </head>
  <body>
    Am fancy
  </body>
</html>
```

---

#### Enable remote logging
> Make sure you have CORS enabled if logging cross-domain.

```javascript
//Request type is POST

Logerr.init({
  remoteLogging: true, //Checkout https://github.com/i-break-codes/logerr-remote
  remoteSettings: {
    url: 'REMOTE_URL',
    batchUrl: 'REMOTE_BATCH_URL',
    additionalParams: {
      logged_by: 'Sam'
    },
    successCallback: function () {
      console.log('Im logged.');
    },
    errorCallback: function () {
      console.log('Err! Something went wrong.');
    }
  }
});
```

---

#### Default Configuration & Datatypes
```javascript
detailedErrors: false          //Boolean true/false, optional
remoteLogging: false          //Boolean true/false, optional
remoteSettings: {             //Object {}, required if remoteLogging is set to true
  url: null,                  //String '', required if remoteLogging is set to true
  batchUrl: null,             //String '', required if remoteLogging is set to true
  syncInterval: 2000,         //Number, required if remoteLogging is set to true
  additionalParams: null,     //Object {}, optional
  successCallback: null,      //function() {}, optional
  errorCallback: null         //function() {}, optional
}

```

---

#### Roadmap
- integration in ELK stack (Elasticsearch/Logstash/Kibana)
---

#### Support
- Bugs and requests, submit them through the project's issues section

Thanks to all contributors, stargazers, pr's, issue submissions for suggesting features and making this more awesome.
