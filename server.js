const http = require('http')
const { v4: uuidv4 } = require('uuid')
const errorHandle = require('./errorHandle')
const { error } = require('console')

const todos = []

const requestListener = (req, res) => {
  // 設定 HTTP Headers 資訊 - CORS
  const headers = {
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'PATCH, POST, GET,OPTIONS,DELETE',
    'Content-Type': 'application/json'
  }

  // 接收 HTTP request 的 body 資訊
  let body = ''
  req.on('data', chunk => {
    body += chunk
  })

  if (req.url === '/todos' && req.method === 'GET') {
    res.writeHead(200, headers)
    res.write(JSON.stringify({
      isSuccess: true,
      todos
    }))
    res.end()
  } else if (req.url === '/todos' && req.method === 'POST') {
    req.on('end', () => {
      try {
        const content = JSON.parse(body).content
        if (content !== undefined) {
          const todo = {
            id: uuidv4(),
            content,
            isCompleted: false,
            createdAt: Date.now(),
            updatedAt: null
          }
          todos.push(todo)

          res.writeHead(200, headers)
          res.write(JSON.stringify({
            isSuccess: true,
            data: todos
          }))
          res.end()
        } else {
          errorHandle(res)
        }
      } catch (error) {
        errorHandle(res)
      }
    })
  } else if (req.url === '/todos' && req.method === 'DELETE') {
    todos.length = 0
    res.writeHead(200, headers)
    res.write(JSON.stringify({
      isSuccess: true,
      message: '全部刪除成功',
      data: todos
    }))
    res.end()
  } else if (req.url.startsWith('/todos/') && req.method === 'DELETE') {
    const id = req.url.split('/').pop()
    const index = todos.findIndex(element => element.id === id)
    // 若無此 todo，回報 error
    if (index === -1) {
      errorHandle(res)
      return
    }
    // 若有此 todo，刪除該 todo
    todos.splice(index, 1)
    res.writeHead(200, headers)
    res.write(JSON.stringify({
      isSuccess: true,
      message: `已刪除 todo: ${id}`,
      data: todos
    }))
    res.end()
  } else if (req.url.startsWith('/todos/') && req.method === 'PATCH') {
    req.on('end', () => {
      try {
        const id = req.url.split('/').pop()
        const index = todos.findIndex(element => element.id === id)
        const content = JSON.parse(body).content
        if (content !== undefined || index !== -1) {
          todos[index].content = content
          todos[index].updatedAt = Date.now()

          res.writeHead(200, headers)
          res.write(JSON.stringify({
            isSuccess: true,
            data: todos
          }))
          res.end()
        } else {
          errorHandle(res)
        }
      } catch (error) {
        errorHandle(res)
      }
    })
  } else if (req.method === 'OPTIONS') { // 建立 Preflight OPTIONS API 機制
    res.writeHead(200, headers)
    res.end()
  } else {
    res.writeHead(404, headers) // 建立 404 頁面
    res.write('Oops! 404 Not found')
    res.end()
  }
}

const server = http.createServer(requestListener)

// 監聽 port
const port = process.env.port || 3000
server.listen(port, () => {
  console.log(`Server started on port ${port}`)
})
