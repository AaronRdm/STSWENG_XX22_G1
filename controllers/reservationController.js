const db = require('../models/db.js');

const User = require('../models/userdb.js');

const Admin = require('../models/admindb.js');

const Reservation = require('../models/reservationdb.js');

const reservationController = {

    get_reservations: async function (req, res) {
		
		if ( req.session.id_number != req.query.id_number ) {
			res.redirect('/Reservation?id_number=' + req.session.id_number );
		}else{
			const query = { id_number: req.query.id_number };
			const projection = "id_number";
			
			const is_admin = await db.find_one(Admin, query, projection);
	
			const result = await db.find_many(Reservation, query);
            
            console.log(query)
            console.log(result)
			if ( is_admin != null ) {
				res.render('Reservation', {display_UI: 1, result: result, id_number: req.query.id_number, is_admin: true});
			} else {
				res.render('Reservation', {display_UI: 0, result: result, id_number: req.query.id_number, is_admin: false});
			}
		}

		
    },

    get_reservation_admin: async function (req, res) {

		if ( req.session.id_number != req.query.id_number )
        {
			const query = { id_number: req.session.id_number };
			const projection = "id_number";

			const is_admin = await db.find_one(Admin, query, projection);

			if ( is_admin != null ){
				res.redirect('/ReservationAdmin?id_number=' + req.session.id_number );
			}else{
				res.render('Error');
			}
			
		}
        else
        {
			const details = {
				id_number: req.session.id_number,
			}
	
			res.render('ReservationAdmin', details);
		}

    },

	//Add reservation
	post_reservations: async function (req, res) {
        /*
            when submitting forms using HTTP POST method
            the values in the input fields are stored in `req.body` object
            each <input> element is identified using its `name` attribute
            Example: the value entered in <input type="text" name="fName">
            can be retrieved using `req.body.fName`
        */		
		if (req.body.user_id_number != ""){

			const id_number = req.body.user_id_number;

			const query = { id_number: id_number};
			const projection = "id_number";
			const result = await db.find_one(User, query, projection);
			const result2 = await db.find_one(Admin, query, projection);
			
			if (result) {
				var id_num = req.body.user_id_number;
			} else if (result2) {
				var id_num = req.body.user_id_number;
			} else {
				var id_num = 0;
				console.log('User does not exist');
			}

		}
		else{
			var id_num = req.body.hidden_ID_number;
		}
			
        var rsv = {
			start_campus: req.body.hidden_start_campus,
			date: req.body.user_date,
			entry_loc: req.body.hidden_entry_loc,
			entry_time: req.body.hidden_entry_time,
			exit_loc: req.body.hidden_exit_loc,
			exit_time: req.body.hidden_exit_time,
		  };

		if ( rsv.entry_loc == "Entry Location" || rsv.entry_time == "Entry Time" || rsv.exit_loc == "Exit Location" || rsv.exit_time == "Exit Time" ){
			res.redirect('/Reservation?id_number=' + req.body.admin_id + '&reserve_user_success=false');
			console.log('Reservation failed to add');
		}
		else{

			var result;
			if (id_num !== 0) {
				rsv.id_number = id_num;
				result = await db.insert_one(Reservation, rsv);
			}
			/*
				calls the function insert_one()
				defined in the `database` object in `../models/db.js`
				this function adds a document to collection `reservations`
			*/
			
			if ( result ){
				console.log('Reservation successfully added');
				res.redirect('/Reservation?id_number=' + req.body.admin_id + '&reserve_user_success=true');
			}
			else{
				res.redirect('/Reservation?id_number=' + req.body.admin_id + '&reserve_user_success=false');
				console.log('Reservation failed to add');
			}
		}

    },

	post_update_reservations: async function (req, res){
		var curr ={
			start_campus: req.body.e_curr_start_campus,
			date: req.body.e_curr_date,
			entry_loc: req.body.e_curr_entry_loc,
			entry_time: req.body.e_curr_entry_time,
			exit_loc: req.body.e_curr_exit_loc,
			exit_time: req.body.e_curr_exit_time,
			id_number: req.body.e_curr_id_number
		}

		var upd = {
			start_campus: req.body.e_hidden_start_campus,
			date: req.body.user_date,
			entry_loc: req.body.e_hidden_entry_loc,
			entry_time: req.body.e_hidden_entry_time,
			exit_loc: req.body.e_hidden_exit_loc,
			exit_time: req.body.e_hidden_exit_time,
			id_number: req.body.e_hidden_id_number
		}
		
		if ( upd.entry_loc == "Entry Location" || upd.entry_time == "Entry Time" || upd.exit_loc == "Exit Location" || upd.exit_time == "Exit Time" ){
			res.redirect('/Reservation?id_number=' + req.body.e_hidden_id_number + '&is_update_success=false');
			console.log('Reservation failed to add');
		}
		else
        {
            console.log("OG Information:");
            console.log(curr)
            console.log("NEW Information:");
            console.log(upd)
			var found = await db.find_one(Reservation, curr); //Reservation not found here



			if(found)
            {
				await db.update_one(Reservation, curr, upd);
				console.log('succesfully updated');
				res.redirect('/Reservation?id_number=' + req.body.e_hidden_id_number + '&is_update_success=true');
			}
			else
            {
				console.log("Code monkeys did an oopsie daisy");
				console.log('error somewhere');
			}
		}

		
	},

	post_delete: async function (req, res){
		var rsv = {
			start_campus: req.body.d_curr_start_campus,
			date: req.body.d_curr_date,
			entry_loc: req.body.d_curr_entry_loc,
			entry_time: req.body.d_curr_entry_time,
			exit_loc: req.body.d_curr_exit_loc,
			exit_time: req.body.d_curr_exit_time,
			id_number: req.body.d_curr_id_number
		};

		console.log('to delete');
		console.log(rsv);
		var deleted = await db.delete_one(Reservation, rsv);
		if(deleted){
			console.log('succesfully deleted');
			res.redirect('/Reservation?id_number=' + req.body.d_curr_id_number + '&is_delete_success=true');
		}
		else{
			console.log("Code monkeys did an oopsie daisy");
			console.log('error somewhere');
		}

	},

	get_search_user: async function (req, res){

		res.redirect('/ReservationAdmin?id_number=' + req.query.id_number);

	},

	post_search_user: async function (req, res){

		var id_number = req.body.user_id_number;
		var admin_id = req.body.admin_id;

		const isFoundUser = await db.find_one(User, {id_number: id_number}, {id_number: 1});
		const isFoundAdmin = await db.find_one(Admin, {id_number: id_number}, {id_number: 1});

		if ( isFoundUser == null && isFoundAdmin == null ){
			res.redirect('/ReservationAdmin?id_number=' + admin_id + '&is_search_user_valid=false');
		}
		else{

			console.log('test');
			const result = await db.find_many(Reservation, {id_number: id_number}, "");

			if ( result.length !== 0 ){
				res.render('ReservationAdmin', {result: result, admin_id: admin_id});
			} 
			else {
				res.redirect('/ReservationAdmin?id_number=' + admin_id + '&reservation_list=false');
			}

		}
	},

	post_search_user_update: async function (req, res){
		var curr ={
			start_campus: req.body.e_curr_start_campus,
			date: req.body.e_curr_date,
			entry_loc: req.body.e_curr_entry_loc,
			entry_time: req.body.e_curr_entry_time,
			exit_loc: req.body.e_curr_exit_loc,
			exit_time: req.body.e_curr_exit_time,
			id_number: req.body.e_curr_id_number
		}

		var upd = {
			start_campus: req.body.e_hidden_start_campus,
			date: req.body.user_date,
			entry_loc: req.body.e_hidden_entry_loc,
			entry_time: req.body.e_hidden_entry_time,
			exit_loc: req.body.e_hidden_exit_loc,
			exit_time: req.body.e_hidden_exit_time,
			id_number: req.body.e_hidden_id_number
		}

		console.log("current reservation:");
		console.log(curr);
		console.log("To be updated with: ");
		console.log(upd);

		if (upd.entry_loc == "Entry Location" || upd.entry_time == "Entry Time" || upd.exit_loc == "Exit Location" || upd.exit_time == "Exit Time" ){

			var admin_id = req.body.e_admin_id;
			if (admin_id == null){
				console.log("OH NO THE CODE MONKEYS DID AN OOPSIE WOOPSIE");
				admin_id = 1111111;
			}
			const result = await db.find_many(Reservation, {id_number: upd.id_number}, {_id:0, __v:0});

			res.render('ReservationAdmin', {result, result, admin_id: admin_id, is_update_success: false});
			console.log('Reservation failed to add');

		}
		else{
			var found = await db.find_one(Reservation, curr);
			if(found){
				await db.update_one(Reservation, curr, upd);
				console.log('Succesfully updated');
				
				var admin_id = req.body.e_admin_id;
				if (admin_id == null){
					console.log("OH NO THE CODE MONKEYS DID AN OOPSIE WOOPSIE");
					admin_id = 1111111;
				}
				const result = await db.find_many(Reservation, {id_number: upd.id_number}, {_id:0, __v:0});
				res.render('ReservationAdmin', {result: result, admin_id: admin_id, is_update_success: true});
			}
			else{
				console.log("Code monkeys did an oopsie daisy");
				console.log('error somewhere');
			}
		}
		

	},

	post_search_user_delete: async function (req, res){
		var rsv = {
			start_campus: req.body.d_curr_start_campus,
			date: req.body.d_curr_date,
			entry_loc: req.body.d_curr_entry_loc,
			entry_time: req.body.d_curr_entry_time,
			exit_loc: req.body.d_curr_exit_loc,
			exit_time: req.body.d_curr_exit_time,
			id_number: req.body.d_curr_id_number
		};

		console.log('to delete');
		console.log(rsv);
		var deleted = await db.delete_one(Reservation, rsv);
		if(deleted){
			console.log('succesfully deleted');
			
			var admin_id = req.body.d_admin_id;
			if (admin_id == null){
				console.log("OH NO THE CODE MONKEYS DID AN OOPSIE WOOPSIE");
				admin_id = 1111111;
			}
			const result = await db.find_many(Reservation, {id_number: rsv.id_number}, {_id:0, __v:0});
			res.render('ReservationAdmin', {result: result, admin_id: admin_id, is_delete_success: true});
		}
		else{
			console.log("Code monkeys did an oopsie daisy");
			console.log('error somewhere');
		}

	}
    
}

module.exports = reservationController;
