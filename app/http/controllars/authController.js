
const User = require('../../models/user');

const bcrypt = require('bcrypt');
const passport = require('passport');
function authController() {

    const _getRedirectUrl = (req)=>{
        return req.user.role ==='admin' ?'/admin/orders' : '/customer/orders'
    }


    return {

        login: (req, res) => {
            return res.render("auth/login");
        },
        postLogin: (req, res, next) => {

            const { email, password } = req.body;
            
            // vaidate request

            if (!email || !password) {
                req.flash('error', 'all fields are require')
                
                return res.redirect('/login')
            }


            passport.authenticate('local', (err, user, info) => {

                if (err) {
                    req.flash('error', info.message)
                    return next(err)
                }

                if (!user) {
                    req.flash('error', info.message)
                    return res.redirect('/login')
                }

                req.login(user, (err) => {
                    if (err) {
                        req.flash('error', info.message)
                        return next(err)
                    }

                    return res.redirect(_getRedirectUrl(req))
                })

            })(req, res, next)
        },


        register: (req, res) => {
            return res.render("auth/register");
        }
        ,
        postRegister: async (req, res) => {
            const { name, email, password } = req.body;

            // vaidate request

            if (!name || !email || !password) {
                req.flash('error', 'all fields are require')
                req.flash('name', name);
                req.flash('email', email);
                return res.redirect('/register')
            }

            //cheak if email exists

            User.exists({ email: email }, (err, result) => {

                if (result) {
                    req.flash('error', 'email already taker')
                    req.flash('name', name);
                    req.flash('email', email);
                    return res.redirect('/register')
                }
            })

            //Hash passwor


            const hashedpassword = await bcrypt.hash(password, 10);
            //  create a user

            const user = new User({
                name: name,
                email: email,
                password: hashedpassword
            })

            //save the user
            user.save().then((user) => {
                //login user

                return res.redirect('/')
            }).catch(err => {

                req.flash('error', 'Something went wrong')
                return res.redirect('/register')

            })

        },

         logout: (req, res) => {
           req.logout()

           res.redirect('/login')
        }

    }
    
  
}

module.exports = authController;