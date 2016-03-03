var sshConfig = require('ssh-config');

var fs = require('fs');

var outputLocation = process.env.HOME + '/Library/Application Support/iTerm2/DynamicProfiles/profiles.json';

fs.readFile(process.env.HOME + '/.ssh/config', function (err, data) {
  if (err) {
    throw err;
  }

  config = sshConfig.parse(data.toString());

  var output = {
    Profiles: [],
  };

  for (var i = 0, len = config.length; i < len; i++) {
    var section = config[i];

    var host = section.Host;

    var comment = null;
    var commentIndex = section.Host.indexOf('#');

    if (commentIndex !== -1) {
      host = section.Host.substr(0, commentIndex);
      comment = section.Host.substr(commentIndex + 1).trim();
    }
    var host = host.trim();

    // Skip Wildcard Entries
    if (host.indexOf('*') != -1) continue;

    // Use the Comment as a name if it exists.
    var name = comment ? comment : host;

    if (section['#Label']) {
      name = section['#Label'];
    }
    var itermObj = {
      'Guid' : host,
      'Name' : name,
      'ShortCut' : '',
      'Custom Command' : 'Yes',
      'Command' : 'ssh ' + host,
    }

    if (section['#Tags']) {
      itermObj.Tags = section['#Tags'].split(',').map(function (tag) {
        return tag.trim();
      });
    }
    output.Profiles.push(itermObj);
  }

  var json = JSON.stringify(output, null, '  ');
  console.log(json);
  fs.writeFile(outputLocation, json, function(err) {
    if(err) {
      throw err;
    }
    console.log("Saved %d entires into your iTerm2 Profile.\n", output.Profiles.length);
  });
});
