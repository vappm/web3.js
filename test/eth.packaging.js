var chai = require('chai');
var assert = chai.assert;
var FakeHttpProvider = require('./helpers/FakeHttpProvider');
var Web3 = require('../packages/web3');
var sha3 = require('../packages/web3-utils').sha3;
var asciiToHex = require('../packages/web3-utils').asciiToHex;

describe('packaging', function () {
    var provider;
    var web3;

    describe('in normal operation', function () {
        beforeEach(function () {
            provider = new FakeHttpProvider();
            web3 = new Web3(provider);

            provider.injectResult({
                timestamp: Math.floor(new Date() / 1000) - 60,
            });
            provider.injectValidation(function (payload) {
                assert.equal(payload.jsonrpc, '2.0');
                assert.equal(payload.method, 'eth_getBlockByNumber');
                assert.deepEqual(payload.params, ['latest', false]);
            });

            provider.injectResult(1);
            provider.injectValidation(function (payload) {
                assert.equal(payload.jsonrpc, '2.0');
                assert.equal(payload.method, 'net_version');
                assert.deepEqual(payload.params, []);
            });

            provider.injectResult({
                hash: '0xd4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa3',
                blockNumber: '0x0'
            });

            provider.injectValidation(function (payload) {
                assert.equal(payload.jsonrpc, '2.0');
                assert.equal(payload.method, 'eth_getBlockByNumber');
                assert.deepEqual(payload.params, ['0x0', false]);
            });
        });

        it('should have a hello world function', function () {
            assert.equal(web3.eth.packaging.hello(), "Hello World");
        });

        it('should set registry URL with implicit provider', function () {
            var packagingObject = web3.eth.packaging.registry("packages.ethpm.eth")

            assert.equal(packagingObject.registryUrl, "packages.ethpm.eth");
            assert.equal(packagingObject.provider, provider);
        });

        it('should set registry URL with explicit provider', function () {
            var customProvider = new FakeHttpProvider();
            var packagingObject = web3.eth.packaging.registry("packages.ethpm.eth", {
                provider: customProvider
            });

            assert.equal(packagingObject.registryUrl, "packages.ethpm.eth");
            assert.equal(packagingObject.provider, customProvider);
        });

        it('should get package artifact with implicit version number', function (done) {
            var packagePromise = web3.eth.packaging
                .registry("packages.ethpm.eth")
                .package("MyPackage")


            packagePromise
                .then(function (packageArtifact) {
                    assert.equal(packageArtifact, "");
                    done();
                })
                .catch(function (err) {
                    done(err || new Error("Promise was rejected"))
                });
        });

        it('should get package artifact with explicit version number', function (done) {
            var packagePromise = web3.eth.packaging
                .registry("packages.ethpm.eth")
                .package("MyPackage", { version: "^1.1.5" })
            
            packagePromise
                .then(function (packageArtifact) {
                    assert.equal(packageArtifact, "");
                    done();
                })
                .catch(function (err) {
                    done(err || new Error("Promise was rejected"))
                });
        });
    });
});