/////////////////////////////////////////////////////////////
///                                                       ///
///  PST ROTATOR CLIENT SCRIPT FOR FM-DX-WEBSERVER (V1.0) ///
///                                                       ///
///  by Highpoint                last update: 23.07.24    ///
///                                                       ///
///  https://github.com/Highpoint2000/PSTRotator   		  ///
///                                                       ///
/////////////////////////////////////////////////////////////

(() => {
    const PSTRotatorPlugin = (() => {
        // Add CSS styles
        const style = document.createElement('style');
        style.textContent = `
            body {
                margin: 0;
                padding: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                position: relative;
            }
            .canvas-container {
                display: flex;
                align-items: center;
            }
            #signal-canvas {
                width: 81%;
            }
            #container {
                position: relative;
                margin-left: 10px; /* Space between the two containers */
            }
            #background {
                position: absolute;      
                width: 220px;
                height: 265px;
            }
            #background img {
                height: 90%;
				margin-top: -60px;
				margin-left: 0px;
                object-fit: cover;
            }
            #myCanvas {
                position: relative;
				top: -33px;
                left: -13px;
         
            }
            #innerCircle {
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 25px;
                height: 25px;
                border-radius: 50%;
                background-color: rgba(255, 255, 255, 0);
                cursor: pointer;
                display: none;
            }
            #position {
                position: absolute;
                bottom: 10px;
                left: 10px;
                font-size: 15px;
                color: #333;
            }
        `;
        document.head.appendChild(style);

        // Function to dynamically add HTML elements
        function addHtmlElements() {
            const canvasContainer = document.querySelector('.canvas-container');
            if (canvasContainer) {
                console.log('Found .canvas-container element.');

                // Check if container already exists
                if (!document.getElementById('container')) {
                    const container = document.createElement('div');
                    container.id = 'container';
                    container.innerHTML = `
                        <div class="hide-phone">
                            <div id="background">
                                <img src="http://highpoint2000.selfhost.de:8080/Rotor/Rotor.png" alt="Background Image">
                            </div>
                            <canvas id="myCanvas" width="225" height="225"></canvas>
                            <div id="innerCircle" title="View Bearing Map"></div>
                        </div>
                    `;

                    canvasContainer.appendChild(container);
                    console.log('HTML elements added successfully.');
					
					let $serverInfoContainer = $('#tuner-name').parent();
					$serverInfoContainer.removeClass('panel-100').addClass('panel-75').css('padding-left', '20px');
										
                } else {
                    // console.log('#container already exists.');
                }
            } else {
                console.error('Element with class "canvas-container" not found');
            }
        }

        // Load jQuery
        function loadScript(url, callback) {
            const script = document.createElement('script');
            script.src = url;
            script.onload = callback;
            script.onerror = () => {
                console.error(`Failed to load script: ${url}`);
            };
            document.head.appendChild(script);
        }

        // Main functionality
        function main() {
            const $ = window.jQuery;

            // Ensure jQuery is loaded
            if (!$) {
                console.error('jQuery is not loaded.');
                return;
            }

            addHtmlElements();

            const canvas = $('#myCanvas')[0];
            const ctx = canvas.getContext('2d');

            let x = canvas.width / 2;
            let y = canvas.height / 2;
            const radius = 25;
            let lineAngle = 26;
            const lineLength = 74;

            function drawCircleAndLines() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, 2 * Math.PI);
                ctx.strokeStyle = '#ED7D31';
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.closePath();

                ctx.font = 'bold 20px Calibri';
                ctx.fillStyle = '#ED7D31';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText((lineAngle + 90) % 360 + '°', x, y);

                const lineStartX = x + radius * Math.cos(lineAngle * Math.PI / 180);
                const lineStartY = y + radius * Math.sin(lineAngle * Math.PI / 180);
                const lineEndX = x + (radius + lineLength) * Math.cos(lineAngle * Math.PI / 180);
                const lineEndY = y + (radius + lineLength) * Math.sin(lineAngle * Math.PI / 180);

                ctx.beginPath();
                ctx.moveTo(lineStartX, lineStartY);
                ctx.lineTo(lineEndX, lineEndY);
                ctx.strokeStyle = '#ED7D31';
                ctx.stroke();
                ctx.closePath();
            }

            function loadWebSocket() {
                const ws = new WebSocket('ws://highpoint2000.selfhost.de:3000');

                ws.onopen = () => {
                    console.log('WebSocket connection highpoint2000.selfhost.de:3000 established');
                };

                ws.onmessage = (event) => {
                    try {
                        const position = event.data.trim();
                        
                        if (isNaN(position)) {
                            throw new Error('Invalid position data received');
                        }

                        if (position >= 0 && position <= 360) {
                            lineAngle = position - 90;
                            drawCircleAndLines();
                        } else {
                            console.warn('Received position is out of range:', position);
                        }
                    } catch (error) {
                        console.error('Error processing WebSocket message:', error);
                    }
                };

                ws.onerror = (error) => {
                    console.error('WebSocket error:', error);
                };

                ws.onclose = () => {
                    console.log('WebSocket connection closed');
                };
            }

            // Execute functions
            addHtmlElements();
            loadWebSocket();
        }

        // Load jQuery and execute main script
        loadScript('https://code.jquery.com/jquery-3.6.0.min.js', main);

    })();
})();
