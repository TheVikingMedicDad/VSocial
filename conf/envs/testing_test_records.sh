#!/usr/bin/env bash
# Here you can override some of the default fixtures (test records) for creating the test data
# which are needed for the automated tests.
export CSD_TESTING_USER_DEFAULT_PASSWORD=${CSD_TESTING_USER_DEFAULT_PASSWORD:-"123456"}
export CSD_TESTING_USER_DEFAULT_EMAIL_DOMAIN=${CSD_TESTING_USER_DEFAULT_EMAIL_DOMAIN:-"example.com"}