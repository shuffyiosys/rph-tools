# RPH Tools Programming Notes
## The Module Paradigm
RPH tools is built off the idea that each component is built into self-contained modules. The paradigm is similar to classes in OOP. While it's understood that JavaScript as of ECMAScript 2015 has classes, this style provides the facility to encaspulate "private" members of the module and allows the developer to only expose what they want.

The module template is as follows:
```Javascript
var [ModuleName] = (function(){
  /* Declare module members here */
    var html = {
    'tabId': [Module ID name],
    'tabName': [Module title],
    'tabContents': [Module HTML]
  };

  /* Initializes the module */
  var init = function(){
      
  };

  /* Exposes the following to the rest of the script. i.e, anything you want 
      public must be declared here. */
  return {
      init : init,

      getHtml : function(){
          return html;
      },

      toString : function(){
          return '[Module Name] Module';
      },
  };
}());
```

RPH Tools has been developed with the following rules for modules:
* It _must_ have a function tied to ```init``` in the return blob. This initializes the module. 
* If the module contains HTML code, it must also have the ```getHtml``` function. The init function is meant to register HTML handlers with jQuery or the native ```document``` object.

While there is a main ```RPH Tools``` module, this is not necessarily required for RPH Tools to work, provided similar functionality is offered. In addition, the ```init``` function need not exist either, as long as there's no real need to initialize anything with the module. Just note that the main ```RPH Tools``` module was made to execute the script.

## Common parts to a module
The following are parts common to all modules. Some of these are required. Most are optional. Note that unless a component is marked required, **assume the part is optional** and you should check to make sure it exists before trying to use it.

### init function (MANDATORY)
This initializes the module. rph-tools will call this when it's initializing on every module.

### toString function
Returns a string describing the module

### processAccountEvt function
When RPH sends the client an account data blob, this is function will process what to do with it.

### getSettings
Gets persistent settings that are saved for a module.

### saveSettings
Saves persistent settings of a module

### loadSettings
Loads persistent settings of a module

### deleteSettings
Deletes persistent settings and loads in default ones of a module.

### getHtml function
Returns the html dictionary. **NOTE**: This is MANDATORY if html is being used and you want RPH Tools to use it.

### html dictionary 
This contains the data necessary for the module to be it's own HTML block in the Settings page of RPH. It needs to have the following to work:
- ```tabId```: This fills in the HTML ```id``` attribute
- ```tabName```: This is the name of the module's GUI tab title in the Settings window
- ```tabContents```: This is the HTML of the page in the Settings window for this module

## Considerations when creating or modifying modules
### Remember to add your module to main.js
```main.js``` contains an array of all modules that will be active in the script. If you want the main ```RPH Tools``` module to run your module, it must be inlcuded in that array.

### Modules do not need GUI components (HTML)
While all of RPH Tool's default modules are GUI components of the script, they need not contain any GUI or HTML functions to work. If all a module is doing is listening on client events, then it can do so without the need for HTML. If there are any settings that need configuring though, it's recommended to add a GUI component.

### Cross Module Dependency
The main consideration when creating or modify modules is that the module may or may not exist. Always check if the module exists. Also the existance of another module _should not_ be mandatory. **Always** make module dependencies optional. In the event a module is not available, a default operation should be used instead.

For example in RPH Tool's default setup, the ```Chat``` module has this:

```Javascript
if (moddingModule !== null) {
  moddingModule.addModFeatures(thisRoom);
}
```
If the existance of the ```Modding``` module (```moddingModule```) is true, then a feature can be used in conjunction with the ```Chat``` module. However this is not an essential function, so no default action is needed. Likewise, the feature that the ```Modding``` module that uses does not need the ```Chat``` module to exist or even call its function.