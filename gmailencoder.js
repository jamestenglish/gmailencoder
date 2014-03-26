window.onload=function(){
String.prototype.splice = function( idx, s ) {
    return (this.slice(0,idx) + s + this.slice(idx));
};

String.prototype.del = function(idx, length) {
    return (this.slice(0,idx - 1) + this.slice(idx - 1 - length ));
};

function generateDots(number) {
    return Array(number+1).join(".");
};

function toBinaryString(number) {
    return number.toString(2).split("").reverse().join("");
};

function getLetterPosition(letter) {
    return letter.charCodeAt(0) - "a".charCodeAt(0) + 1;
};

function convertLetterToDots(letter, numDots) {
    var dots = [];
    var position = getLetterPosition(letter);
    var binaryRep = toBinaryString(position);
    ko.utils.arrayForEach(binaryRep, function(digit) {
        if(digit === "1") {
            dots.push(generateDots(numDots));
        } else {
            dots.push("");
        }
    });
    return dots;
};

// This is a simple *viewmodel* - JavaScript that defines the data and behavior of your UI
function AppViewModel() {
    this.email = ko.observable("someone@gmail.com");
    this.message = ko.observable("secret");

    this.encodedEmail = ko.computed(function() {
        var double = 1;
        var lowerMessage = this.message().toLowerCase();
        var isOnlyAZ = /^[a-z]+$/.test(lowerMessage);
        if(!isOnlyAZ) {
            return "Error, can only store messages charaters a-z";
        }
        
        var to = this.email().split('@')[0];
        if(to.length < 6) {
            return "Error, sorry the part before the @ needs to be 6 characters";
        }
        if(to.indexOf(".") !== -1) {
            return "Error, sorry you can't have '.' in the part before the @";
        }
        var dots = [];
        ko.utils.arrayForEach(lowerMessage, function(letter) {
            dots.push(convertLetterToDots(letter, double));
            double *= 2;
        }, this);
        var encoded = "";
        var letters = to.split("");
        var index = 0;
        ko.utils.arrayForEach(letters, function(letter) {
            var allDots = "";
            ko.utils.arrayForEach(dots, function(dot) {
                if(dot.length > index) {
                    allDots += dot[index];
                }
            });
            encoded = encoded + letter + allDots;
            index++;
        });
        encoded = encoded + generateDots(lowerMessage.length);
        return encoded + "@" + this.email().split('@')[1];
    }, this);
    
    this.cryptEmail = ko.observable(this.encodedEmail());
    this.decodedEmail = ko.computed(function() {
        var to = this.cryptEmail().split('@')[0];
        var dots = to.split(/[^.]/g);
        dots.splice(0,1)
        var lengthDots = dots.pop();
        var length = lengthDots.match(/\./g).length;
        var double = Math.pow(2, length - 1);
        var chars = [];
        for(var i = double; i >= 1; i /= 2 ) {

            var char = "";
            var index = 0;
            ko.utils.arrayForEach(dots, function(dot) {
                if(!dot) {
                    char += "0";
                } else {
                    var dotNum = dot.match(/\./g).length;
                    
                    if(dotNum >= i) {
                        char += "1";
                        var newDots = dot.split("");
                        newDots.splice(0, i );
                        var newDotString = newDots.join("");
                        dots[index] = newDotString
                    } else {
                        char += "0";
                    }
                }
                index++;
            });
            chars.push(char);
        }
        chars.reverse();

        var message = "";
        ko.utils.arrayForEach(chars, function(char) {
            var number = parseInt(char.split('').reverse().join(''), 2)
            var letter = String.fromCharCode(number + "a".charCodeAt(0) - 1);
            message += letter;
        });
        return message;
        
    }, this);

};

// Activates knockout.js
ko.applyBindings(new AppViewModel());
};
