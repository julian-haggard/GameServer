const path = require('path')
const net = require('net')

const args = require('gar')(process.argv.slice(2))

const canvax = require(path.join(__dirname, 'canvax_module.js'))
const commonAbstractorFactory = require(path.join(__dirname, 'commonAbstractorFactory.js'))

let clients = []

const gameState = {
	'enemies': [],
	'width': 1280,
	'height': 720
}

const addEnemy = () => {
	const direction = Math.floor(Math.random() * 2)
	
	const x = Math.floor(Math.random() * gameState.width)
	const y = Math.floor(Math.random() * gameState.height)
	
	gameState.enemies.push({
		'direction': direction,
		'xspeed': direction === 0 ? 1 : 0,
		'yspeed': direction === 1 ? 1 : 0,
		'entity': new canvax.Circle(x, y, 30, '#FF5546', 'none')
	})
}

for (let i = 0; i < 5; i++) {
	addEnemy()
}

const randomHex = () => Math.floor(Math.random() * 17).toString(16).toUpperCase()

const randomColor = () => {
	let build = '#'
	
	for (let i = 0; i < 6; i++) {
		build += randomHex()
	}
	
	return build
}

const server = net.createServer((socket) => {
	console.log('A client connected.')
	
	const abstractor = commonAbstractorFactory()
	
	socket.abstractor = abstractor
	
	socket.data = {
		'keys': [],
		'score': 0,
		'vel': {
			'x': 0,
			'y': 0
		},
		'entity': new canvax.Rectangle(200, 200, 30, 30, randomColor(), 'none')
	}
	
	socket.pipe(socket.abstractor)
	abstractor.pipe(socket)
	
	clients.push(socket)
	
	socket.on('close', () => {
		console.log('A client disconnected.')
		
		clients.splice(clients.indexOf(socket), 1)
	})
	
	socket.on('error', (err) => {
		console.log('A client errored. ' + err)
	})
	
	abstractor.on('profile', (data) => {
		socket.data.name = data.name
	})
	
	abstractor.on('keydown', (data) => {
		data.key = data.key.toLowerCase()
		
		if (!socket.data.keys.includes(data.key)) socket.data.keys.push(data.key)
	})

	abstractor.on('keyup', (data) => {
		data.key = data.key.toLowerCase()
		
		if (socket.data.keys.includes(data.key)) socket.data.keys.splice(socket.data.keys.indexOf(data.key), 1)
	})
})

server.listen(5135, () => {
	console.log('Listening.')
})

setInterval(() => {
	// Update enemy data

	for (let i = 0; i < gameState.enemies.length; i++) {
		const enemy = gameState.enemies[i]
		
		enemy.entity.x += enemy.xspeed
		enemy.entity.y += enemy.yspeed
		
		if (enemy.entity.y > gameState.height || enemy.entity.y < 0) enemy.yspeed *= -1
		
		if (enemy.entity.x > gameState.width || enemy.entity.x < 0) enemy.xspeed *= -1
	}
	
	// Update client data (movement)
	
	for (let i = 0; i < clients.length; i++) {
		const client = clients[i]
		
		if (client.data.keys.includes('arrowup')) {
			client.data.vel.y += -0.4
		}
		
		if (client.data.keys.includes('arrowdown')) {
			client.data.vel.y += 0.4
		}
		
		if (client.data.keys.includes('arrowright')) {
			client.data.vel.x += 0.4
		}
		
		if (client.data.keys.includes('arrowleft')) {
			client.data.vel.x += -0.4
		}
		
		if (client.data.entity.x < 0 && client.data.vel.x < 0) client.data.vel.x = 0
		if (client.data.entity.x > gameState.width - 90 && client.data.vel.x > 0) client.data.vel.x = 0
			
		if (client.data.entity.y < 0 && client.data.vel.y < 0) client.data.vel.y = 0
		if (client.data.entity.y > gameState.height - 90 && client.data.vel.y > 0) client.data.vel.y = 0
		
		client.data.vel.y *= 0.91
		client.data.vel.x *= 0.91
		
		client.data.entity.x += client.data.vel.x
		client.data.entity.y += client.data.vel.y
	}
	
	// Detect collisions
	
	for (let i = 0; i < clients.length; i++) {
		const client = clients[i]
		
		if (typeof client.data !== 'object') continue
		
		for (let i = 0; i < gameState.enemies.length; i++) {
			const enemy = gameState.enemies[i]
			
			if (enemy.entity.intersects(client.data.entity)) {
				client.data.score = 0
				
				client.data.entity.x = 100
				client.data.entity.y = 100
			}
		}
	}
}, 5)

setInterval(() => {
	const renderData = {
		'entities': []
	}
	
	// Render players
	
	for (let i = 0; i < clients.length; i++) {
		const client = clients[i]
		
		if (typeof client.data !== 'object') continue
		
		renderData.entities.push({
			'type': 0,
			'color': client.data.entity.backgroundColor,
			'x': client.data.entity.x,
			'y': client.data.entity.y,
			'width': client.data.entity.width,
			'height': client.data.entity.height,
			'xvel': client.data.vel.x,
			'yvel': client.data.vel.y,
			'name': (typeof client.data.name === 'string' ? client.data.name : '') + ' (' + client.data.score + ')'
		})
	}
	
	// Render enemies
	
	for (let i = 0; i < gameState.enemies.length; i++) {
		const enemy = gameState.enemies[i]
		
		renderData.entities.push({
			'type': 1,
			'color': enemy.entity.backgroundColor,
			'x': enemy.entity.x,
			'y': enemy.entity.y,
			'width': enemy.entity.radius,
			'height': enemy.entity.radius,
			'xvel': enemy.xspeed,
			'yvel': enemy.yspeed,
			'name': ''
		})
	}
	
	// Send out renderData
	
	for (let i = 0; i < clients.length; i++) {
		clients[i].abstractor.send('render', renderData)
	}
}, 1)