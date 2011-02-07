Event.simulateMouse=function(d,b){var c=Object.extend({pointerX:0,pointerY:0,buttons:0,ctrlKey:false,altKey:false,shiftKey:false,metaKey:false},arguments[2]||{});var a=document.createEvent("MouseEvents");a.initMouseEvent(b,true,true,document.defaultView,c.buttons,c.pointerX,c.pointerY,c.pointerX,c.pointerY,c.ctrlKey,c.altKey,c.shiftKey,c.metaKey,0,$(d));if(this.mark){Element.remove(this.mark)}this.mark=document.createElement("div");this.mark.appendChild(document.createTextNode(" "));document.body.appendChild(this.mark);this.mark.style.position="absolute";this.mark.style.top=c.pointerY+"px";this.mark.style.left=c.pointerX+"px";this.mark.style.width="5px";this.mark.style.height="5px;";this.mark.style.borderTop="1px solid red;";this.mark.style.borderLeft="1px solid red;";if(this.step){alert("["+new Date().getTime().toString()+"] "+b+"/"+Test.Unit.inspect(c))}$(d).dispatchEvent(a)};Event.simulateKey=function(d,b){var c=Object.extend({ctrlKey:false,altKey:false,shiftKey:false,metaKey:false,keyCode:0,charCode:0},arguments[2]||{});var a=document.createEvent("KeyEvents");a.initKeyEvent(b,true,true,window,c.ctrlKey,c.altKey,c.shiftKey,c.metaKey,c.keyCode,c.charCode);$(d).dispatchEvent(a)};Event.simulateKeys=function(b,c){for(var a=0;a<c.length;a++){Event.simulateKey(b,"keypress",{charCode:c.charCodeAt(a)})}};var Test={};Test.Unit={};Test.Unit.inspect=Object.inspect;Test.Unit.Logger=Class.create();Test.Unit.Logger.prototype={initialize:function(a){this.log=$(a);if(this.log){this._createLogTable()}},start:function(a){if(!this.log){return}this.testName=a;this.lastLogLine=document.createElement("tr");this.statusCell=document.createElement("td");this.nameCell=document.createElement("td");this.nameCell.className="nameCell";this.nameCell.appendChild(document.createTextNode(a));this.messageCell=document.createElement("td");this.lastLogLine.appendChild(this.statusCell);this.lastLogLine.appendChild(this.nameCell);this.lastLogLine.appendChild(this.messageCell);this.loglines.appendChild(this.lastLogLine)},finish:function(a,b){if(!this.log){return}this.lastLogLine.className=a;this.statusCell.innerHTML=a;this.messageCell.innerHTML=this._toHTML(b);this.addLinksToResults()},message:function(a){if(!this.log){return}this.messageCell.innerHTML=this._toHTML(a)},summary:function(a){if(!this.log){return}this.logsummary.innerHTML=this._toHTML(a)},_createLogTable:function(){this.log.innerHTML='<div id="logsummary"></div><table id="logtable"><thead><tr><th>Status</th><th>Test</th><th>Message</th></tr></thead><tbody id="loglines"></tbody></table>';this.logsummary=$("logsummary");this.loglines=$("loglines")},_toHTML:function(a){return a.escapeHTML().replace(/\n/g,"<br/>")},addLinksToResults:function(){$$("tr.failed .nameCell").each(function(a){a.title="Run only this test";Event.observe(a,"click",function(){window.location.search="?tests="+a.innerHTML})});$$("tr.passed .nameCell").each(function(a){a.title="Run all tests";Event.observe(a,"click",function(){window.location.search=""})})}};Test.Unit.Runner=Class.create();Test.Unit.Runner.prototype={initialize:function(a){this.options=Object.extend({testLog:"testlog"},arguments[1]||{});this.options.resultsURL=this.parseResultsURLQueryParameter();this.options.tests=this.parseTestsQueryParameter();if(this.options.testLog){this.options.testLog=$(this.options.testLog)||null}if(this.options.tests){this.tests=[];for(var c=0;c<this.options.tests.length;c++){if(/^test/.test(this.options.tests[c])){this.tests.push(new Test.Unit.Testcase(this.options.tests[c],a[this.options.tests[c]],a.setup,a.teardown))}}}else{if(this.options.test){this.tests=[new Test.Unit.Testcase(this.options.test,a[this.options.test],a.setup,a.teardown)]}else{this.tests=[];for(var b in a){if(/^test/.test(b)){this.tests.push(new Test.Unit.Testcase(this.options.context?" -> "+this.options.titles[b]:b,a[b],a.setup,a.teardown))}}}}this.currentTest=0;this.logger=new Test.Unit.Logger(this.options.testLog);setTimeout(this.runTests.bind(this),1000)},parseResultsURLQueryParameter:function(){return window.location.search.parseQuery()["resultsURL"]},parseTestsQueryParameter:function(){if(window.location.search.parseQuery()["tests"]){return window.location.search.parseQuery()["tests"].split(",")}},getResult:function(){var b=false;for(var a=0;a<this.tests.length;a++){if(this.tests[a].errors>0){return"ERROR"}if(this.tests[a].failures>0){b=true}}if(b){return"FAILURE"}else{return"SUCCESS"}},postResults:function(){if(this.options.resultsURL){new Ajax.Request(this.options.resultsURL,{method:"get",parameters:"result="+this.getResult(),asynchronous:false})}},runTests:function(){var a=this.tests[this.currentTest];if(!a){this.postResults();this.logger.summary(this.summary());return}if(!a.isWaiting){this.logger.start(a.name)}a.run();if(a.isWaiting){this.logger.message("Waiting for "+a.timeToWait+"ms");setTimeout(this.runTests.bind(this),a.timeToWait||1000)}else{this.logger.finish(a.status(),a.summary());this.currentTest++;this.runTests()}},summary:function(){var d=0;var b=0;var e=0;var c=[];for(var a=0;a<this.tests.length;a++){d+=this.tests[a].assertions;b+=this.tests[a].failures;e+=this.tests[a].errors}return((this.options.context?this.options.context+": ":"")+this.tests.length+" tests, "+d+" assertions, "+b+" failures, "+e+" errors")}};Test.Unit.Assertions=Class.create();Test.Unit.Assertions.prototype={initialize:function(){this.assertions=0;this.failures=0;this.errors=0;this.messages=[]},summary:function(){return(this.assertions+" assertions, "+this.failures+" failures, "+this.errors+" errors\n"+this.messages.join("\n"))},pass:function(){this.assertions++},fail:function(a){this.failures++;this.messages.push("Failure: "+a)},info:function(a){this.messages.push("Info: "+a)},error:function(a){this.errors++;this.messages.push(a.name+": "+a.message+"("+Test.Unit.inspect(a)+")")},status:function(){if(this.failures>0){return"failed"}if(this.errors>0){return"error"}return"passed"},assert:function(c){var a=arguments[1]||'assert: got "'+Test.Unit.inspect(c)+'"';try{c?this.pass():this.fail(a)}catch(b){this.error(b)}},assertEqual:function(b,d){var a=arguments[2]||"assertEqual";try{(b==d)?this.pass():this.fail(a+': expected "'+Test.Unit.inspect(b)+'", actual "'+Test.Unit.inspect(d)+'"')}catch(c){this.error(c)}},assertInspect:function(b,d){var a=arguments[2]||"assertInspect";try{(b==d.inspect())?this.pass():this.fail(a+': expected "'+Test.Unit.inspect(b)+'", actual "'+Test.Unit.inspect(d)+'"')}catch(c){this.error(c)}},assertEnumEqual:function(b,d){var a=arguments[2]||"assertEnumEqual";try{$A(b).length==$A(d).length&&b.zip(d).all(function(e){return e[0]==e[1]})?this.pass():this.fail(a+": expected "+Test.Unit.inspect(b)+", actual "+Test.Unit.inspect(d))}catch(c){this.error(c)}},assertNotEqual:function(b,d){var a=arguments[2]||"assertNotEqual";try{(b!=d)?this.pass():this.fail(a+': got "'+Test.Unit.inspect(d)+'"')}catch(c){this.error(c)}},assertIdentical:function(b,d){var a=arguments[2]||"assertIdentical";try{(b===d)?this.pass():this.fail(a+': expected "'+Test.Unit.inspect(b)+'", actual "'+Test.Unit.inspect(d)+'"')}catch(c){this.error(c)}},assertNotIdentical:function(b,d){var a=arguments[2]||"assertNotIdentical";try{!(b===d)?this.pass():this.fail(a+': expected "'+Test.Unit.inspect(b)+'", actual "'+Test.Unit.inspect(d)+'"')}catch(c){this.error(c)}},assertNull:function(c){var a=arguments[1]||"assertNull";try{(c==null)?this.pass():this.fail(a+': got "'+Test.Unit.inspect(c)+'"')}catch(b){this.error(b)}},assertMatch:function(c,f){var b=arguments[2]||"assertMatch";var a=new RegExp(c);try{(a.exec(f))?this.pass():this.fail(b+' : regex: "'+Test.Unit.inspect(c)+" did not match: "+Test.Unit.inspect(f)+'"')}catch(d){this.error(d)}},assertHidden:function(a){var b=arguments[1]||"assertHidden";this.assertEqual("none",a.style.display,b)},assertNotNull:function(a){var b=arguments[1]||"assertNotNull";this.assert(a!=null,b)},assertType:function(b,d){var a=arguments[2]||"assertType";try{(d.constructor==b)?this.pass():this.fail(a+': expected "'+Test.Unit.inspect(b)+'", actual "'+(d.constructor)+'"')}catch(c){this.error(c)}},assertNotOfType:function(b,d){var a=arguments[2]||"assertNotOfType";try{(d.constructor!=b)?this.pass():this.fail(a+': expected "'+Test.Unit.inspect(b)+'", actual "'+(d.constructor)+'"')}catch(c){this.error(c)}},assertInstanceOf:function(b,d){var a=arguments[2]||"assertInstanceOf";try{(d instanceof b)?this.pass():this.fail(a+": object was not an instance of the expected type")}catch(c){this.error(c)}},assertNotInstanceOf:function(b,d){var a=arguments[2]||"assertNotInstanceOf";try{!(d instanceof b)?this.pass():this.fail(a+": object was an instance of the not expected type")}catch(c){this.error(c)}},assertRespondsTo:function(d,c){var a=arguments[2]||"assertRespondsTo";try{(c[d]&&typeof c[d]=="function")?this.pass():this.fail(a+": object doesn't respond to ["+d+"]")}catch(b){this.error(b)}},assertReturnsTrue:function(f,d){var b=arguments[2]||"assertReturnsTrue";try{var a=d[f];if(!a){a=d["is"+f.charAt(0).toUpperCase()+f.slice(1)]}a()?this.pass():this.fail(b+": method returned false")}catch(c){this.error(c)}},assertReturnsFalse:function(f,d){var b=arguments[2]||"assertReturnsFalse";try{var a=d[f];if(!a){a=d["is"+f.charAt(0).toUpperCase()+f.slice(1)]}!a()?this.pass():this.fail(b+": method returned true")}catch(c){this.error(c)}},assertRaise:function(a,d){var b=arguments[2]||"assertRaise";try{d();this.fail(b+": exception expected but none was raised")}catch(c){((a==null)||(c.name==a))?this.pass():this.error(c)}},assertElementsMatch:function(){var a=$A(arguments),b=$A(a.shift());if(b.length!=a.length){this.fail("assertElementsMatch: size mismatch: "+b.length+" elements, "+a.length+" expressions");return false}b.zip(a).all(function(f,c){var d=$(f.first()),e=f.last();if(d.match(e)){return true}this.fail("assertElementsMatch: (in index "+c+") expected "+e.inspect()+" but got "+d.inspect())}.bind(this))&&this.pass()},assertElementMatches:function(a,b){this.assertElementsMatch([a],b)},benchmark:function(c,d){var b=new Date();(d||1).times(c);var a=((new Date())-b);this.info((arguments[2]||"Operation")+" finished "+d+" iterations in "+(a/1000)+"s");return a},_isVisible:function(a){a=$(a);if(!a.parentNode){return true}this.assertNotNull(a);if(a.style&&(Element.getStyle(a,"display")=="none"||Element.getStyle(a,"visibility")=="hidden")){return false}return this._isVisible(a.parentNode)},assertNotVisible:function(a){this.assert(!this._isVisible(a),Test.Unit.inspect(a)+" was not hidden and didn't have a hidden parent either. "+(""||arguments[1]))},assertVisible:function(a){this.assert(this._isVisible(a),Test.Unit.inspect(a)+" was not visible. "+(""||arguments[1]))},benchmark:function(c,d){var b=new Date();(d||1).times(c);var a=((new Date())-b);this.info((arguments[2]||"Operation")+" finished "+d+" iterations in "+(a/1000)+"s");return a}};Test.Unit.Testcase=Class.create();Object.extend(Object.extend(Test.Unit.Testcase.prototype,Test.Unit.Assertions.prototype),{initialize:function(name,test,setup,teardown){Test.Unit.Assertions.prototype.initialize.bind(this)();this.name=name;if(typeof test=="string"){test=test.gsub(/(\.should[^\(]+\()/,"#{0}this,");test=test.gsub(/(\.should[^\(]+)\(this,\)/,"#{1}(this)");this.test=function(){eval("with(this){"+test+"}")}}else{this.test=test||function(){}}this.setup=setup||function(){};this.teardown=teardown||function(){};this.isWaiting=false;this.timeToWait=1000},wait:function(b,a){this.isWaiting=true;this.test=a;this.timeToWait=b},run:function(){try{try{if(!this.isWaiting){this.setup.bind(this)()}this.isWaiting=false;this.test.bind(this)()}finally{if(!this.isWaiting){this.teardown.bind(this)()}}}catch(a){this.error(a)}}});Test.setupBDDExtensionMethods=function(){var METHODMAP={shouldEqual:"assertEqual",shouldNotEqual:"assertNotEqual",shouldEqualEnum:"assertEnumEqual",shouldBeA:"assertType",shouldNotBeA:"assertNotOfType",shouldBeAn:"assertType",shouldNotBeAn:"assertNotOfType",shouldBeNull:"assertNull",shouldNotBeNull:"assertNotNull",shouldBe:"assertReturnsTrue",shouldNotBe:"assertReturnsFalse",shouldRespondTo:"assertRespondsTo"};Test.BDDMethods={};for(m in METHODMAP){Test.BDDMethods[m]=eval("function(){var args = $A(arguments);var scope = args.shift();scope."+METHODMAP[m]+".apply(scope,(args || []).concat([this])); }")}[Array.prototype,String.prototype,Number.prototype].each(function(p){Object.extend(p,Test.BDDMethods)})};Test.context=function(d,c,f){Test.setupBDDExtensionMethods();var e={};var g={};for(specName in c){switch(specName){case"setup":case"teardown":e[specName]=c[specName];break;default:var b="test"+specName.gsub(/\s+/,"-").camelize();var a=c[specName].toString().split("\n").slice(1);if(/^\{/.test(a[0])){a=a.slice(1)}a.pop();a=a.map(function(h){return h.strip()});e[b]=a.join("\n");g[b]=specName}}new Test.Unit.Runner(e,{titles:g,testLog:f||"testlog",context:d})};