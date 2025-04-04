import app from './app'


const port = 4000

app.listen(port,'0.0.0.0', () => {
  console.log(`App listening at http://localhost:${port}`)
})
