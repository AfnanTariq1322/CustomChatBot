document.addEventListener('DOMContentLoaded', function () {
    class Chatbox {
        constructor() {
            this.args = {
                openButton: document.querySelector('.chatbox__icon'),
                chatBox: document.querySelector('.chatbox'),
                sendButton: document.querySelector('.chatbox__send--footer'),
                closeButton: document.querySelector('.chatbox__close'),
            };

            this.state = false;
            this.messages = [];
            this.greetingDisplayed = false;  // Flag to check if greeting is displayed
        }

        display() {
            const { openButton, chatBox, sendButton, closeButton } = this.args;

            if (!openButton || !chatBox || !sendButton || !closeButton) {
                console.error('Error: Could not find required elements.');
                return;
            }

            openButton.addEventListener('click', () => this.toggleState());
            sendButton.addEventListener('click', () => this.onSendButton(chatBox));

            const node = chatBox.querySelector('input');
            node.addEventListener("keyup", ({ key }) => {
                if (key === "Enter") {
                    this.onSendButton(chatBox);
                }
            });

            closeButton.addEventListener('click', () => this.toggleState());
        }

        toggleState() {
            this.state = !this.state;

            if (this.state) {
                this.args.chatBox.style.display = 'block';
                this.args.chatBox.classList.add('chatbox--active');

                // Only send static greeting once
                if (!this.greetingDisplayed) {
                    setTimeout(() => {
                        let msg = { name: "Bot", message: "Hey there! How can I help you today?  " };
                        this.messages.push(msg);
                        this.updateChatText(this.args.chatBox);
                        this.greetingDisplayed = true; // Mark greeting as displayed
                    }, 500); // Delay for effect
                }
            } else {
                this.args.chatBox.classList.remove('chatbox--active');
                this.args.chatBox.style.display = 'none';
            }
        }

        onSendButton(chatbox) {
            const textField = chatbox.querySelector('input');
            let text1 = textField.value;
            if (text1 === "") {
                return;
            }

            let msg1 = { name: "User", message: text1 };
            this.messages.push(msg1);
            this.updateChatText(chatbox);

            setTimeout(() => {
                let msg2 = { name: "Bot", message: "Typing..." };  // Show typing status first
                this.messages.push(msg2);
                this.updateChatText(chatbox);

                // Call the local Flask API to get the chatbot's response
                this.getChatbotResponse(text1, (responseText) => {
                    msg2.message = responseText;  // Bot's actual response
                    this.updateChatText(chatbox);
                });

                textField.value = '';  // Clear input field
            }, 500);
        }

        updateChatText(chatbox) {
            var html = '';
            this.messages.slice().reverse().forEach(function (item) {
                if (item.name === "User") {
                    html += '<div class="messages__item messages__item--operator"><img src="1703354587672.jpeg" />' + item.message + '</div>';
                } else {
                    html += '<div class="messages__item messages__item--visitor"><img src="chatbot.png" />' + item.message + '</div>';
                }
            });

            const chatmessage = chatbox.querySelector('.chatbox__messages');
            chatmessage.innerHTML = html;
        }

        getChatbotResponse(userMessage, callback) {
            // Prepare the request payload
            const data = {
                message: userMessage  // Send message to the local Flask server
            };

            // Call the local Flask API
            fetch('http://localhost:5000/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
                .then(response => response.json())
                .then(data => {
                    // Check if the response contains the correct structure and extract the bot response
                    if (data && data.response) {
                        const botResponse = data.response;  // Bot's actual response
                        callback(botResponse);  // Pass the bot's response back to the callback function
                    } else {
                        console.error('Invalid response structure:', data);
                        callback("Sorry, I couldn't get a response. Please try again.");
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    callback("Sorry, I couldn't get a response. Please try again.");
                });
        }
    }

    const chatbox = new Chatbox();
    chatbox.display();
});



