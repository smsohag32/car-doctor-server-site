# query params

- diay some data read kora jay ...

- query params bookings?email=sohag@gmail.com

- find er parameter er vitor query ta set korle query ta matching kore data dibay ...

```
const updated doc = {
$set: {
name: req.body.name;

}
}


```

# jwt example

```
app.get('/jwt', (req,res)=>{
      const user = req.body;
      const token = jwt.sing(user, process.env.ACCESS_TOKEN, {expiresIn: '1h'})
      res.send({token})
    })
    app.get('/services', async (req,res)=>{
      const result = await servicesCollection.find().toArray();
      res.send(result);
    })



```
