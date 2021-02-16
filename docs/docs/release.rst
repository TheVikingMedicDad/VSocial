Release a new Version
*********************

Create Release
==============

1. Develop mut include all features we want to deploy
1. Develop must run through all CI tests
1. Create release branch `release/X.Y.Z` from develop and push
1. Checkout release branch
1. Change Version Number
1. Update change log `docs/docs/changes.rst`
1. Manual testing and bugfixing continues on release branch (no additional branches needed)


Development can continue on develop branch.


Deploy Release
==============

After all automatic and manual tests and QA is successfully on the release branch we can actually deploy

1. checkout release branch and tag it
    * `git tag -a -m "vX.Y.Z" vX.Y.Z`
    * `git push --tags`
1. create PR `release/X.Y.Z` --> master
1. create PR `release/X.Y.Z` --> develop
1. merge the release branch int master and develop (don't close the release branch)
1. deployment is done automatically by Drone CI/CD System
