const db = require('../models/db.js');

const User = require('../models/userdb.js');
const Admin = require('../models/admindb.js');
const Driver = require('../models/driverdb.js');

const forgotPassController = {

    get_forgot_password: function (req, res) {
        res.render('ForgotPassword', res);
    },

    post_forgot_password: async function (req, res){

        var query = {email: req.body.user_email, security_code: req.body.user_security_code};
        var projection = 'id_number email security_code'
        const user_result = await db.find_one(User, query, projection);
        const admin_result = await db.find_one(Admin, query, projection);
        const driver_result = await db.find_one(Driver, query, projection);

        var details = {};

        if ( user_result != null && (user_result.email == req.body.user_email && user_result.security_code == req.body.user_security_code) ) {
            console.log('User email and security code match.');

            details = {
                id_number: user_result.id_number,
                email: user_result.email,
                security_code: user_result.security_code
            }

            res.render('ForgotPassword', details);
        }
        else if ( admin_result != null && (admin_result.email == req.body.user_email && admin_result.security_code == req.body.user_security_code) ) {
            console.log('Admin email and security code match.');

            details = {
                id_number: admin_result.id_number,
                email: admin_result.email,
                security_code: admin_result.security_code
            }
            res.render('ForgotPassword', details);
        }
        else if ( driver_result != null && (driver_result.email == req.body.user_email && driver_result.security_code == req.body.user_security_code) ) {
            console.log('Driver email and security code match.');

            details = {
                id_number: driver_result.id_number,
                email: driver_result.email,
                security_code: driver_result.security_code
            }
            res.render('ForgotPassword', details);
        }
        else
        {
            res.render('ForgotPassword', { is_invalid: true });
        }

    },

    post_change_F_password: async function (req, res){

        var new_password = req.body.user_new_password;
        var retype_password = req.body.user_retype_password;

        if ( new_password == retype_password ){

            var query = {id_number: req.body.id_number};
            const projection = { id_number: 1, password: 1};

            const user_result = await db.find_one(User, query, projection);
            const admin_result = await db.find_one(Admin, query, projection);
            const driver_result = await db.find_one(Driver, query, projection);

            if ( user_result != null ) {
                await db.updateOne(User, query, {password: req.body.user_retype_password})
                console.log("Change password successful");
                res.render('Login', { code_change: true } );
            }
            else if ( admin_result != null ) {
                await db.updateOne(Admin, query, {password: req.body.user_retype_password})
                console.log("Change password successful");
                res.render('Login', { code_change: true } );
            }
            else if ( driver_result != null ) {
                await db.updateOne(Driver, query, {password: req.body.user_retype_password})
                console.log("Change password successful");
                res.render('Login', { code_change: true } );
            } else {
                console.log("User/Admin password change unsuccessful. No user/admin found.");
                res.render('ForgotPassword', res);
            }

        }
        else{
            res.render('ForgotPassword', { isMatch: false, id_number: req.body.id_number } );
        }

        

    }
}

module.exports = forgotPassController;