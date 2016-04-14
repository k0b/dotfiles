var Greeter = (function () {
    function Greeter(greeting) {
        this.greeting = greeting;
    }
    Greeter.prototype.greet = function () {
        return this.greeting;
    };
    return Greeter;
})();
;
var greeter = new Greeter("Hello, world!");
console.log(greeter.greet());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL1VzZXJzL2phbWVzLy5hdG9tL3BhY2thZ2VzL3NjcmlwdC9leGFtcGxlcy9ncmVldGVyLnRzIiwic291cmNlcyI6WyIvVXNlcnMvamFtZXMvLmF0b20vcGFja2FnZXMvc2NyaXB0L2V4YW1wbGVzL2dyZWV0ZXIudHMiXSwibmFtZXMiOlsiR3JlZXRlciIsIkdyZWV0ZXIuY29uc3RydWN0b3IiLCJHcmVldGVyLmdyZWV0Il0sIm1hcHBpbmdzIjoiQUFBQSxJQUFNLE9BQU87SUFDWEEsU0FESUEsT0FBT0EsQ0FDUUEsUUFBZ0JBO1FBQWhCQyxhQUFRQSxHQUFSQSxRQUFRQSxDQUFRQTtJQUFJQSxDQUFDQTtJQUN4Q0QsdUJBQUtBLEdBQUxBO1FBQ0VFLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBO0lBQ3ZCQSxDQUFDQTtJQUNIRixjQUFDQTtBQUFEQSxDQUFDQSxBQUxELElBS0M7QUFBQSxDQUFDO0FBRUYsSUFBSSxPQUFPLEdBQUcsSUFBSSxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUM7QUFFM0MsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIEdyZWV0ZXIge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgZ3JlZXRpbmc6IHN0cmluZykgeyB9XG4gIGdyZWV0KCkge1xuICAgIHJldHVybiB0aGlzLmdyZWV0aW5nO1xuICB9XG59O1xuXG52YXIgZ3JlZXRlciA9IG5ldyBHcmVldGVyKFwiSGVsbG8sIHdvcmxkIVwiKTtcblxuY29uc29sZS5sb2coZ3JlZXRlci5ncmVldCgpKTtcbiJdfQ==
//# sourceURL=/Users/james/.atom/packages/script/examples/greeter.ts
