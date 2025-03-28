
<<<<<<< HEAD
// ❌  app.listen(port)  (not connecting with socket)
// ✅ server.listen(port) (Required for both Express routes and WebSocket connections)
server.listen(port, () => {
  console.log(`Server is running at port: ${port}`);
});
=======
app.get("/", (req, res) => {
  res.send("Server Running")
})


app.listen(port, () => { console.log(`server is running at port: ${port}`) })
>>>>>>> 0ba70c9b0185c1eb1b1cf55f9b566965e317e05f