const axios = require('axios');
const mustache = require('mustache');

const API = "https://api.github.com/repos/rwynn/monstache/releases";
const OPTIONS =  {
	headers: { 'Accept': 'application/vnd.github.v3+json' }
};

const template = `

### [{{{name}}}]({{{url}}})

{{{body}}}

`;

const getMarkDown = function({name, body, html_url}) {
	const data = {
		name: name,
		body: body,
		url: html_url
	};
	return mustache.render(template, data);
};

let markdown = [];
const getReleases = function(page) {
	axios.get(`${API}?page=${page}`, OPTIONS)
		.then(response => {
			const releases = response.data;
			if (releases.length > 0) {
				releases.forEach(release => {
					const md = getMarkDown(release);
					markdown.push(md);
				});
				getReleases(page + 1);
			} else {
				console.log(markdown.join(""));
			}
		})
		.catch(error => {
			console.log(error);
		});

};
getReleases(1);

