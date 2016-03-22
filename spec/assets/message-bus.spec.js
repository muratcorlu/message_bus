describe("Messagebus", function() {

  it("submits change requests", function(done){
    spyOn(this.MockedXMLHttpRequest.prototype, 'send').and.callThrough();
    var spec = this;
    MessageBus.subscribe('/test', function(){
      expect(spec.MockedXMLHttpRequest.prototype.send)
        .toHaveBeenCalled()
      var req = JSON.parse(spec.MockedXMLHttpRequest.prototype.send.calls.argsFor(0)[0]);
      expect(req['/test']).toEqual(-1)
      expect(req['__seq']).not.toBeUndefined();
      done()
    });
  });

  it("calls callbacks", function(done){
    MessageBus.subscribe('/test', function(message){
      expect(message.password).toEqual('MessageBusRocks!');
      done();
    });
  });

  it('stores messages when paused, then delivers them when resumed', function(done){
    MessageBus.pause()
    spyOn(this.MockedXMLHttpRequest.prototype, 'send').and.callThrough();
    var spec = this;
    var onMessageSpy = jasmine.createSpy('onMessageSpy');
    MessageBus.subscribe('/test', onMessageSpy);
    setTimeout(function(){
      expect(spec.MockedXMLHttpRequest.prototype.send).toHaveBeenCalled()
      expect(onMessageSpy).not.toHaveBeenCalled()
      MessageBus.resume()
    }, 510) // greater than delayPollTimeout of 500
    setTimeout(function(){
      expect(onMessageSpy).toHaveBeenCalled()
      done()
    }, 550) // greater than first timeout above
  });

  it('can unsubscribe from callbacks', function(done){
    var onMessageSpy = jasmine.createSpy('onMessageSpy');
    MessageBus.subscribe('/test', onMessageSpy);
    MessageBus.unsubscribe('/test', onMessageSpy);
    MessageBus.subscribe('/test', function(){
      expect(onMessageSpy).not.toHaveBeenCalled()
      done()
    });
  });

  testMB('sets dlp paramater when longPolling is disabled', function(){
    MessageBus.enableLongPolling = false
    this.perform(function(message, xhr){
      expect(xhr.url).toMatch("dlp=t");
    }).finally(function(){
      MessageBus.enableLongPolling = true
    })
  });

  testMB('respects baseUrl setting', function(){
    MessageBus.baseUrl = "/a/test/base/url/";
    this.perform(function(message, xhr){
      expect(xhr.url).toMatch("/a/test/base/url/");
    }).finally(function(){
      MessageBus.baseUrl = "/";
    })
  });

});
