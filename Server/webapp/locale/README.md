Translations
============

### Installation
Install gettext on your mac:
```
brew install gettext
brew link --force gettext
```


Create message files by:
```
./cli/generate_webapp_server_translations.sh
```

The above command generates/updates the language files to the current folder.
After modifying the location files you have to recompile them (when building the container files the cli compile them automatically).

```
python manage.py compilemessages
```


Restart Django inside the docker container


## Notes / Hints

Be aware of [fuzzy translation entries](https://www.gnu.org/software/gettext/manual/html_node/Fuzzy-Entries.html)!
*manage.py makemessages* may create them but they will be ignored by *manage.py compilemessages*. Just delete them to save time.
