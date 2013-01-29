
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Chat' })
};

exports.chat = function(req, res){
  res.render('chat', { title: 'Chat' })
};


