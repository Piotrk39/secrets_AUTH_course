// login route

user.findOne({ email: req.body.email }, function (err, foundUser) {
    if (err) {
        console.log(err);
    } else {
        if (foundUser) {
            if (bcrypt.compareSync(req.body.password, foundUser.password)) {
                res.render("secrets");
            }
        }
    }
});

// register route

const hash = bcrypt.hashSync(req.body.password, salt);
 
    const newUser = new user({
        email: req.body.email,
        password: hash
    });
 
    newUser.save(function (err) {
        if (err) {
            console.log(err);
        } else {
            res.render("secrets");
        }
    });