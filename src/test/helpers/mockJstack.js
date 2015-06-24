var JSTACK = {};

JSTACK.Keystone = jasmine.createSpyObj("Keystone", ["init", "authenticate", "gettenants", "params"]);
JSTACK.Nova = jasmine.createSpyObj("Nova", ["attachvolume", "detachvolume", "getserverlist"]);
JSTACK.Cinder = jasmine.createSpyObj("Cinder", ["getvolume", "deletevolume", "createsnapshot", "deletesnapshot", "getsnapshot"]);