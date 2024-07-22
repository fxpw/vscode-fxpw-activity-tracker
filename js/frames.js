

class _frames {
	static CreateHeaderButton(id, svgD) {
		let svgNS = "http://www.w3.org/2000/svg";

		let button = document.createElement('button');
		button.id = id;
		button.className = 'headerButton';

		let svgElementHome = document.createElementNS(svgNS, "svg");
		svgElementHome.setAttribute("width", "24");
		svgElementHome.setAttribute("height", "24");
		svgElementHome.setAttribute("viewBox", "0 0 24 24");
		svgElementHome.setAttribute("fill", "none");

		let pathElementHome = document.createElementNS(svgNS, "path");
		pathElementHome.setAttribute("d", svgD);
		pathElementHome.setAttribute("fill", "currentColor");
		svgElementHome.appendChild(pathElementHome);
		button.appendChild(svgElementHome);

		return button;
	}
	static CreateSpacer() {
		let spacer = document.createElement('div');
		spacer.className = 'spacer';

		return spacer;
	}

	static CreateContainer(id){
		let container = document.createElement('div');
		container.id = id;
		container.className = 'container';
		return container;
	}

	static CreateContainerListButton(requestName,requestData,textleft,textright=null){
		let button = document.createElement('button');
		button.className = "containerListButton";
		
		button.addEventListener('click', function () {
			_requests.Send(requestName,{
				name:requestData,
			});
		});

		let buttonTextLeft = document.createElement('span');
		buttonTextLeft.textContent = textleft;
		buttonTextLeft.className = 'containerListButtonText left';
		
		button.appendChild(buttonTextLeft);
		
		if(textright){

			let spacer = this.CreateSpacer();
			button.appendChild(spacer);

			let buttonTextRight = document.createElement('span');
			buttonTextRight.textContent = textright;
			buttonTextRight.className = 'containerListButtonText right';
			
			button.appendChild(buttonTextRight);

		}
		return button;
	}
}