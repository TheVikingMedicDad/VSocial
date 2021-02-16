..
Todo App Tutorial
#################

This step-by-step guide will show you how can Carrot Seed help you
building your project on solid based foundations. We will show core
functionalities using “Todo” app as an example.

Create todo app on server
*************************
On the server Django is used, if you aren't familiar with the concepts please have a look
at the documentation: https://docs.djangoproject.com/.

Adding the app to Django
========================
In order to start we need to create a new Django app.
Important: you have to execute the following commands
in the docker container webapp-server-webapp-container.

Open the docker container ``webapp-server-webapp-container`` and execute the following
command to create a new app with the name ``todo``:

.. code-block:: bash

    cd webapp
    python ../manage.py startapp todo

After that you should see a new folder called "todo" at ``Server/webapp/webapp``.

We need to define the name of the app. Therefore please open the ``apps.py`` file located in the ``todo`` folder and add
the following lines:

.. code-block:: python
    :caption: Server/webapp/webapp/todo/apps.py
    :name: apps.py
    :emphasize-lines: 4

    from django.apps import AppConfig

    class TodoConfig(AppConfig):
       name = 'webapp.todo'
       verbose_name = 'Todo'

       def ready(self):
           pass

We also need to add the app to the Django settings. To do that open the file ``Server/webapp/config/settings/base.py`` and add the following to ``LOCAL_APPS``

.. code-block:: python
    :caption: Server/webapp/config/settings/base.py
    :name: Installed apps configuration
    :emphasize-lines: 12

    LOCAL_APPS = [
        'webapp.users.apps.UsersAppConfig',
        # Your stuff: custom apps go here
        'webapp.core.apps.CoreAppConfig',
        'webapp.gql.apps.GqlAppConfig',
        'webapp.invitation_system.apps.InvitationSystemAppConfig',
        #
        'webapp.tagging.apps.TaggingConfig',
        #
        'webapp.file_upload.apps.FileUploadConfig',
        'webapp.website.apps.WebsiteConfig',
        'webapp.todo.apps.TodoConfig',
    ]

Creating a todo model
=====================
The next step is to create a new todo model. The model defines how the data should be stored
in the database.

In the created todo app you should see a file called ``models.py``. You could define your models
in here. But it is better to have an explicit model folder where the different models can be stored.

To achieve that please execute the following steps:

#. delete the models.py in your created todo app
#. create a new folder called ``models``
#. inside the ``models`` folder create a ``todo.py`` file
#. inside the ``models`` folder create a ``__init__.py`` to define the module

The next step is to define a model. If you aren't familiar with Django models please read the documentation.

The following code defines the todo model. A todo item has the values ``is_done``, ``text`` and an owner ``created_by``

.. code-block:: python
    :caption: Server/webapp/webapp/todo/models/todo.py
    :name: todo model

    from django.db import models
    from webapp.core.models.base_model import BaseModel


    class Todo(BaseModel):
       is_done = models.BooleanField(default=False)
       text = models.CharField(max_length=200, blank=False, null=False)
       created_by = models.ForeignKey(
           'core.Organisation', on_delete=models.CASCADE, blank=False, null=False, related_name='todos'
       )

       class Meta(BaseModel.Meta):
           verbose_name = 'Todo'
           verbose_name_plural = 'Todos'


We need to tell Python which files are in the ``models`` module. Therefore we need to add the following code in the ``__init__.py`:

.. code-block:: python
    :caption: Server/webapp/webapp/todo/models/__init__.py
    :name: Define module

    from .todo import Todo

After creating the todo model we need to create the tables in the database. Therefore you need to enter the docker container
``webapp-server-webapp`` end execute the following command:

.. code-block:: bash

    python manage.py makemigrations
    python manage.py migrate


Creating the controller and the serializers
===========================================
Next step is defining controllers and serializers for the API.

We'll create a ``controller.py`` inside the ``todo`` folder, which calls the model to create a new todo:

..  code-block:: python
    :caption: Server/webapp/webapp/todo/controller.py
    :name: Controller

    from webapp.core.models.organisation import Organisation
    from webapp.todo.models import Todo

    def create_todo(organisation: Organisation, text: str, is_done: bool):
       """
       This function triggers the Todo creation.

       :param organisation: Django admin Organisation instance
       :param text: str
       :param is_done: boolean
       :return:
       """

       return Todo.objects.create(text=text, is_done=is_done, created_by=organisation)


Next we have to create the ``serializer.py`` inside the ``todo`` folder which is responsible to check incoming data and
serialize outgoing data. We need a serializer for creating, deleting and updating a todo.

.. code-block:: python
    :caption: Server/webapp/webapp/todo/serializer.py
    :name: Controller

    from rest_framework import serializers

    from webapp.todo.controller import create_todo
    from webapp.todo.models import Todo

    class CreateTodoSerializer(serializers.ModelSerializer):
       class Meta:
           model = Todo
           fields = ('text', 'is_done')

       def create(self, validated_data):
           organisation = self.context['request'].user.owned_organisation
           is_done = validated_data['is_done'] if 'is_done' in validated_data else False
           return create_todo(organisation, validated_data['text'], is_done)

    class DeleteTodoSerializer(serializers.ModelSerializer):
       class Meta:
           model = Todo
           fields = ('id',)

    class UpdateTodoSerializer(serializers.ModelSerializer):
       text = serializers.CharField(required=False)

       class Meta:
           model = Todo
           fields = ('id', 'text', 'is_done')

Defining the schema
===================
For the client server communication graphql with graphene is used (https://graphene-python.org/). For that we need to create
a ``schema.py`` for the inside the ``todo`` folder. Again we need a schema for creating, deleting and updating a todo.

.. code-block:: python
    :caption: Server/webapp/webapp/todo/schema.py
    :name: Graphql schema

    import graphene

    from webapp import gql
    from webapp.gql.model_serializer_mutation import GqlModelSerializerMutation
    from webapp.gql.types import CsdDjangoObjectType
    from webapp.gql.utils import custom_filter_function, auth_required
    from webapp.todo.models import Todo
    from webapp.todo.serializer import CreateTodoSerializer, DeleteTodoSerializer, UpdateTodoSerializer


    @custom_filter_function(argument_type=graphene.ID())
    def filter_todo_by_user_id(queryset, filter_value):
        return queryset.filter(created_by__id=filter_value)


    @custom_filter_function(argument_type=graphene.ID())
    def filter_todo_by_is_done(queryset, filter_value):
        return queryset.filter(is_done=filter_value)


    class TodoType(CsdDjangoObjectType):
        class Meta:
            model = Todo
            fields = '__all__'
            interfaces = (gql.Node,)
            csd_filter_fields = {
                'text': [
                    'exact',
                    'iexact',
                    'icontains',
                    'contains',
                    'istartswith',
                    'startswith',
                    'iendswith',
                    'endswith',
                ],
                'is_done': filter_todo_by_is_done,
                'created_by__id': filter_todo_by_user_id,
            }


    class CreateTodoMutation(GqlModelSerializerMutation):
        class Meta:
            serializer_class = CreateTodoSerializer
            model_operations = ['create']
            lookup_field = 'id'
            exclude_fields = ('id',)
            output_field_type = TodoType

        @classmethod
        @auth_required
        def mutate_and_get_payload(cls, root, info, **input):
            return super().mutate_and_get_payload(root, info, **input)


    class DeleteTodoMutation(GqlModelSerializerMutation):
        class Meta:
            serializer_class = DeleteTodoSerializer
            model_operations = ['delete']
            output_field_type = TodoType

        @classmethod
        @auth_required
        def mutate_and_get_payload(cls, root, info, **input):
            return super().mutate_and_get_payload(root, info, **input)


    class UpdateTodoMutation(GqlModelSerializerMutation):
        class Meta:
            serializer_class = UpdateTodoSerializer
            model_operations = ['update']
            output_field_type = TodoType

        @classmethod
        @auth_required
        def mutate_and_get_payload(cls, root, info, **input):
            return super().mutate_and_get_payload(root, info, **input)


    class Query(object):
        todo = gql.Node.Field(TodoType)


    class Mutations(object):
        createTodo = CreateTodoMutation.Field()
        deleteTodo = DeleteTodoMutation.Field()
        updateTodo = UpdateTodoMutation.Field()

We also need to add the schema to the global schema in the Django app. To do this open ``Server/webapp/webapp/core/schema.py`` and edit the file as follows

The todos must be added to the organisation of the user as well (line 11).

.. code-block:: python
    :caption: Server/webapp/webapp/core/schema.py
    :name: Controller
    :emphasize-lines: 11

    import webapp.todo.schema

    #... some code in between
    class OrganisationType(CsdDjangoObjectType):
        class Meta:
            model = Organisation
            exclude_fields = ()
            interfaces = (gql.Node,)
            csd_filter_fields = {'name': ['exact', 'icontains', 'istartswith']}

        #
        todos = OrderedDjangoFilterConnectionField('webapp.todo.schema.TodoType')
        users_selected_organisation = gql.fields.OrderedDjangoFilterConnectionField(
            webapp.users.schema.UserType
        )

    #... some code in between

    class Query(
        webapp.users.schema.Query,
        webapp.invitation_system.schema.Query,
        #
        webapp.tagging.schema.Query,
        graphene.ObjectType,
        #
        webapp.todo.schema.Query
    ):

    #... some code in between

    class Mutations(
        webapp.users.schema.Mutations,
        webapp.invitation_system.schema.Mutations,
        #
        #
        graphene.ObjectType,
        webapp.todo.schema.Mutations
    ):


Writing the unit tests
======================

Now lets try if everything works as expected. To do that we will write some unit tests for the server.

All the server tests are located at ``/Server/tests/api/tests``. Every app has it's own folder there, so lets start to create the folder.

First we need to define the graphql mutations. So lets add some mutations to ``graphql.py``

.. code-block:: python
    :caption: Server/tests/api/tests/graphql.py
    :name: Graphql mutations

    CREATE_TODO_MUTATION = '''
           mutation createTodo($input: CreateTodoMutationInput!) {
             createTodo(input: $input) {
               todo {
                 id
                 text
                 isDone
                 createdBy {
                   id
                 }
               }
               error {
                 id
                 message
               }
             }
           }
       '''

    DELETE_TODO_MUTATION = '''
       mutation deleteTodo($input: DeleteTodoMutationInput!) {
         deleteTodo(input: $input) {
           todo {
             isDone
             text
             id
           }
           error {
             id
             message
           }
         }
       }
       '''

    UPDATE_TODO_MUTATION = '''
       mutation updateTodo($input: UpdateTodoMutationInput!) {
         updateTodo(input: $input) {
           todo {
             isDone
             text
             id
           }
           error {
             id
             message
           }
         }
       }
    '''

    QUERY_ALL_USER_TODOS = '''
       query allUserTodos {
         me {
           ownedOrganisation {
             todos {
               edges {
                 node {
                   id
                   createdBy {
                     id
                   }
                 }
               }
             }
           }
         }
       }
    '''

Now we can write the test. Create the file ``test_todo.py`` inside the ``todo`` folder you've created. We'll create one
test for creating, deleting, updating and querying all todos.

.. code-block:: python
    :caption: Server/tests/api/tests/todo/test_todo.py
    :name: Todo unit tests

    from tests.graphql import (
       QUERY_ALL_USER_TODOS,
       CREATE_TODO_MUTATION,
       DELETE_TODO_MUTATION,
       UPDATE_TODO_MUTATION,
       )
       from tests.utils import execute_gql, execute_gql_mutation


       def test_create(test1_header):
           # GIVEN
           payload = {'text': 'default todo text', 'isDone': False}

           # WHEN
           result = execute_gql_mutation(CREATE_TODO_MUTATION, _headers=test1_header, **payload)

           # THEN
           todo = result['todo']
           assert result['error'] is None
           assert todo['text'] == payload['text']
           assert todo['isDone'] == payload['isDone']


       def test_query(test1_header):
           # GIVEN
           payload = {'text': 'default todo text', 'isDone': False}
           original_todo = execute_gql_mutation(CREATE_TODO_MUTATION, _headers=test1_header, **payload)

           # WHEN
           todos = execute_gql(QUERY_ALL_USER_TODOS, headers=test1_header)

           # THEN
           queried_todo = todos['data']['me']['ownedOrganisation']['todos']['edges'][0]['node']
           assert queried_todo['id'] == original_todo['todo']['id']


       def test_delete(test1_header):
           # GIVEN
           payload = {'text': 'default todo text', 'isDone': False}
           original_todo = execute_gql_mutation(CREATE_TODO_MUTATION, _headers=test1_header, **payload)

           # WHEN
           delete_payload = {'id': original_todo['todo']['id']}
           deleted_todo = execute_gql_mutation(
               DELETE_TODO_MUTATION, _headers=test1_header, **delete_payload
           )

           # THEN
           assert deleted_todo['error'] is None


       def test_update(test1_header):
           # GIVEN
           payload = {'text': 'updated todo text', 'isDone': True}
           original_todo = execute_gql_mutation(CREATE_TODO_MUTATION, _headers=test1_header, **payload)

           # WHEN
           update_payload = {
               'id': original_todo['todo']['id'],
               'text': 'default todo text',
               'isDone': False,
           }
           updated_todo = execute_gql_mutation(
               UPDATE_TODO_MUTATION, _headers=test1_header, **update_payload
           )

           # THEN
           assert updated_todo['error'] is None
           assert updated_todo['todo']['id'] == original_todo['todo']['id']
           assert updated_todo['todo']['text'] == update_payload['text']
           assert updated_todo['todo']['isDone'] == update_payload['isDone']


Now lets see if the tests are working. If you haven't done that already please execute the following cli-script:

.. code-block:: bash

    ./cli/install_dev_server_tests_api.sh

We also need to set the url for testing. This is done by the following command (|REPLACE_DOMAIN|):

.. code-block:: bash

    export CSD_API_TESTING_URL=https://app.example.com.local

After that we can start the tests with the following command:

.. code-block:: bash

    # docker container have to be started
    ./cli/create_dev_db_testing_snapshots.sh
    ./cli/run_tests_server_webapp_api.sh

If all the tests have passed: congratulations - the server is now capable of creating new todo items!

P.S. If you want to run only a specific test you could do the following:

.. code-block:: bash

    ./cli/run_tests_server_webapp_api.sh -s tests/todo/test_todo.py -k test_create


The graphql console
*******************

To test graphql and the mutations we have integrated a console. You'll find that when you open the following link in the browser (|REPLACE_DOMAIN|):
https://app.example.com.local/api/graphql/

There we can test to create a new todo. One important thing is, that we need to authorized in order to create a todo. On the bottom of the screen you'll find two tabs: ``QUERY VARIABLES`` and ``HTTP HEADERS``.
First we need to set the ``HTTP HEADERS``. Therefore you need your authorization token, you'll find it in the Local storage after you have signed into the webapp. Make sure to sign up again after executing the tests.

Add the following to the ``HTTP HEADERS`` and copy your Authorization Token:

.. code-block:: json
    :caption: HTTP HEADERS
    :name: Authtoken in headers

   {
     "Authorization":"Token copy-your-token-here"
   }

Next we'll define the action we want to execute. This is done in the bigger area above the variables and headers. There you can add the following mutation to create a todo:

.. code-block:: typescript
    :caption: Create todo mutation
    :name: mutation

   mutation createTodo($input: CreateTodoMutationInput!) {
     createTodo(input: $input) {
       todo {
         isDone
         text
       }
     }
   }

We can test it by hitting the play button. You should get an error, because we haven't defined the payload yet. To define the payload we need to set the ``QUERY VARIABLES``:

.. code-block:: json
    :caption: QUERY VARIABLES
    :name: query variables

   {
     "input": {
       "text": "Some todo text",
       "isDone": false
     }
   }

When you execute it now you have created your first todo.

We can also query the list by entering the following graphql query:

.. code-block:: typescript
    :caption: Query todo mutation
    :name: mutation

    query allUserTodos {
     me {
       ownedOrganisation {
         todos {
           edges {
             node {
               id
               createdBy {
                 id
               }
             }
           }
         }
       }
     }
   }

After executing this command you should see the todo item you have created earlier.



Create the todo app in the frontend
***********************************

The frontend is created with Angular. You can find the documentation here: https://angular.io/docs

Creating the app
================

At first we have to create the module for our todo app. Therefore you need to open the docker container
``webapp-frontend-webapp``.

.. code-block:: bash

    cd Frontend
    nx g @nrwl/angular:module --name todo --project web-app

We need to show the todos somewhere. Therefore we create a new component inside the newly created ``todo`` folder

.. code-block:: bash

    nx g @nrwl/angular:component --name todo-list-page --path apps/web-app/src/app/todo --project web-app  --skipTests --skipImport
    nx g @nrwl/angular:component --name todo-list --path apps/web-app/src/app/todo --project web-app  --skipTests --skipImport
    nx g @nrwl/angular:component --name todo-item --path apps/web-app/src/app/todo --project web-app  --skipTests --skipImport
    nx g @nrwl/angular:component --name todo-add --path apps/web-app/src/app/todo --project web-app  --skipTests --skipImport


This will create automatically all the files needed for the component.

The todo component should be reachable so we need to define the routing.
Execute the following command inside the ``Frontend`` folder:

.. code-block:: bash

    nx g @nrwl/angular:module --name todo-routing --path apps/web-app/src/app/todo --flat --project web-app

This will automatically create a ``todo-routing.module.ts`` inside of the ``todo`` folder. This defines the routing for this module.

.. code-block:: typescript
    :caption: Frontend/apps/web-app/src/app/todo/todo-routing.module.ts
    :name: set routes for todo app

    import { NgModule } from '@angular/core';
    import { RouterModule, Routes } from '@angular/router';
    import { CsdTodoListPageComponent } from './csd-todo-list-page/csd-todo-list-page.component';
    import { TodoModule } from './todo.module';

    const routes: Routes = [
     {
       path: '',
       canActivate: [],
       pathMatch: 'full',
       component: CsdTodoListPageComponent,
     },
    ] as Routes;

    @NgModule({
     imports: [TodoModule, RouterModule.forChild(routes)],
     exports: [RouterModule],
    })
    export class TodoRoutingModule {}

Last step needed before we can check our new module, is adding it in the
``app-routing`` module which you can find in the ``app`` folder. Currently root page of application is
``PATH_APP_ENTRY_PAGE`` path. We want to replace that with our ``todo``
app.
Thus, replace line containing ``PATH_APP_ENTRY_PAGE``\ with the
following code:


.. code-block:: typescript
    :caption: snipped for Frontend/apps/web-app/src/app/app-routing.module.ts
    :name: set routes for todo app

   { path: '', redirectTo: PATH_NAME_TODO, pathMatch: 'full' },
   { path: PATH_NAME_APP_ENTRY_PAGE, redirectTo: PATH_NAME_TODO, pathMatch: 'full' },

And replace:

.. code-block:: typescript

    {
     path: PATH_NAME_APP_ENTRY_PAGE,
     children: [
       { path: '', component: CsdDashboardPageComponent },
       { path: '', component: CsdUserToolbarComponent, outlet: 'main-toolbar' },
     ],
    },

with:

.. code-block:: typescript
    :caption: snipped for Frontend/apps/web-app/src/app/app-routing.module.ts
    :name: set routes for todo app

    {
     path: PATH_NAME_TODO,
     children: [
       { path: '', loadChildren: './todo/todo-routing.module#TodoRoutingModule' },
       { path: '', component: CsdUserToolbarComponent, outlet: 'main-toolbar' },
     ],
    },

Now, ``todo-list-page`` can be found by visiting ``/``. Second line
makes sure that all apps that were previously related with the original
root page, still work.

When you sign up or sign in you should be redirected automatically to the Todo Page and see the following output:
todo-list-page works!


now lets add the ``todo-list`` component to the ``todo-list-page.component.html``:

.. code-block:: html
    :caption: Frontend/apps/web-app/src/app/todo/todo-list-page/todo-list-page.component.html
    :name: todo-list-page-html

    
    <div class="dta-todo-list-page csd-page">
      <h1 class="csd-title">{{ 'PAGE_TITLE.TODO_LIST' | i18next }}</h1>
      <dta-todo-list></dta-todo-list>
    </div>
    

The "csd-page" and "csd-title" classes is already defined in Carrot Seed if you want to use them. The expression in
the ``h1`` tag is using the i18next translation system which we are using since it has a couple of advantages compared
to the ngx-translate and the angular internal translation system. The first part ``PAGE_TITLE.TODO_LIST`` is a json path
to the actual replacement text which the pipe ``i18next`` is then using.

The translation data can be found in, and needs to be added whenever you see such expressions. At the end of this
tutorial we add all needed english translations for this tutorial. If you forgot to define a translation key then
the key is shown instead of the translation.


.. code-block:: json
    :caption: English translation: Frontend/apps/web-app/src/assets/i18n/en.dta.json
    :name: English translation for todo app

    {
      "PAGE_TITLE": {
            "TODO_LIST": "My List"
      }
    }


.. code-block:: html
    :caption: Frontend/apps/web-app/src/app/todo/todo.module.ts
    :name: todo-module-add-components
    :emphasize-lines: 3-6

    @NgModule({
      declarations: [
        TodoListPageComponent,
        TodoListComponent,
        TodoItemComponent,
        TodoAddComponent
      ],
      imports: [CommonModule],
    })
    export class TodoModule {}



After that the output should change to "todo-list works!" and should be a bit more in the center.



Interact with the server
===============================
As a next step we want to define the graphql queries and mutations which are necessary to interact with the
django graphql server.

#. We define all todo related queries and mutations in the :code:`todo.graphql.ts
#. We define all related types for the todo interaction in :code:`todo.types.ts``
#. We create a angular todo service to easily interact from components :code:`todo.service.ts`
#. Add the UI Logic in the :code:`todo-list-page.component.ts`


Lets start with the graphql queries and mutations

.. code-block:: typescript
    :caption: Frontend/apps/web-app/src/app/todo/todo.graphql.ts
    :name: todo-graphql

    import { gql } from '@apollo/client';
    export const allUserTodosQuery = gql`
      query allUserTodos(
        $orderBy: [String]
        $after: String
        $first: Int
        $before: String
        $last: Int
        $filter: TodoTypeFilterConnectionFilter
      ) {
        me {
          id
          ownedOrganisation {
            id
            todos(
              orderBy: $orderBy
              after: $after
              first: $first
              before: $before
              last: $last
              filter: $filter
            ) {
              totalCount
              pageInfo {
                hasNextPage
                hasPreviousPage
                startCursor
                endCursor
              }
              edges {
                node {
                  id
                  isDone
                  text
                }
              }
            }
          }
        }
      }
    `;

    export const createTodoMutation = gql`
      mutation createTodo($input: CreateTodoMutationInput!) {
        createTodo(input: $input) {
          todo {
            id
            text
            isDone
          }
          error {
            id
            message
          }
        }
      }
    `;

    export const updateTodoMutation = gql`
      mutation UpdateTodo($input: UpdateTodoMutationInput!) {
        updateTodo(input: $input) {
          todo {
            id
            text
            isDone
          }
          error {
            id
            message
          }
        }
      }
    `;

    export const deleteTodoMutation = gql`
      mutation deleteTodo($input: DeleteTodoMutationInput!) {
        deleteTodo(input: $input) {
          todo {
            id
            text
            isDone
          }
          error {
            id
            message
          }
        }
      }
    `;

    export const getTodoQuery = gql`
      query getTodo($id: ID!) {
        todo(id: $id) {
          id
          text
          isDone
        }
      }
    `;


Now to also have a typed interface in typescript not only on graphql level, we need to create several types for
the server interaction. We create a file ``todo.types.ts``


.. code-block:: typescript
    :caption: Frontend/apps/web-app/src/app/todo/todo.types.ts
    :name: todo-types

    import { BaseGqlInput, BaseModel, ID } from '../core/core.types';

    // The core model class. We extend from BaseModel to have some convenience
    // methods. The toReadableId is used eg. for the "Are you sure"-Dialog
    // to present the user with a short representation of the item she wants
    // deleted.
    export class Todo extends BaseModel {
      static typeName = 'Todo';
      id: ID;
      text?: string;
      isDone?: boolean;
      createdById?: string;
      clientMutationId?: string;

      toReadableId(): string {
        return this.text;
      }
    }

    // Needed to have typed input arguments in typescript when we call
    // the createTodoMutation
    export class CreateTodoInput implements BaseGqlInput {
      text: string;
      clientMutationId?: string;
      isDone?: boolean;
    }

    // Same for the updateTodoMutation
    export class UpdateTodoInput implements BaseGqlInput {
      id: ID;
      text?: string;
      isDone?: boolean;
      clientMutationId?: string;
    }


Next we create the todo service where the communication happens.


.. code-block:: typescript
    :caption: Frontend/apps/web-app/src/app/todo/todo.service.ts
    :name: todo-service



    import { Injectable } from '@angular/core';
    import { CsdDataService } from '../core/services/csd-data.service';
    import {
      createTodoMutation,
      deleteTodoMutation,
      getTodoQuery,
      updateTodoMutation,
    } from './todo.graphql';
    import { CreateTodoInput, Todo, UpdateTodoInput } from './todo.types';
    import { BaseGqlInput, ID } from '../core/core.types';
    import { CsdBaseModelService } from '../core/state/csd-base-model.service';
    import { Observable } from 'rxjs';
    import { CsdConfirmDialogService } from '../core/csd-confirm-dialog/csd-confirm-dialog.service';
    import { I18NextPipe } from 'angular-i18next';
    import { CsdMainStateService } from '../main/state/csd-main-state.service';
    import { getRandomInt } from '../core/core.utils';

    @Injectable({
      providedIn: 'root',
    })
    export class TodoService extends CsdBaseModelService<Todo> {
      // here we need to define the Name of the model and also the model class (we defined earlier)
      // the class is needed to create instances of the model
      modelName = 'Todo';
      modelCls = Todo;
      // Here we connect the CRUD graphql queries and mutatuib with the
      // actual http fetching logic from apollo (although it is encapsulated in the CsdBaseModelService)
      createMutation = createTodoMutation;
      updateMutation = updateTodoMutation;
      deleteMutation = deleteTodoMutation;
      getQuery = getTodoQuery;

      constructor(
        protected csdDataService: CsdDataService,
        protected csdMainStateService: CsdMainStateService,
        protected csdConfirmDialogService: CsdConfirmDialogService,
        protected i18NextPipe: I18NextPipe
      ) {
        super(csdDataService, csdMainStateService, csdConfirmDialogService, i18NextPipe);
      }

      getOptimisticResponse(kind, input: BaseGqlInput): any {
        // This is needed if we want optimistic UI (= UI should update immediately not waiting for the
        // server response. Here we construct a fake server response so that the UI can continue while
        // hoping that the server will succeed. If server errors apollo will handle the restoration of
        // a valid state.
        const fakeResponse = {
          __typename: 'Mutation',
        };
        fakeResponse[kind + this.modelName] = {
          todo: {
            isDone: false,
            // we use a negative ID here for unpersisted temporary objects
            id: kind === 'create' ? Todo.toGlobalId(-getRandomInt()) : input['id'],
            __typename: Todo.graphQlTypename,
            ...input,
          },
        };

        return fakeResponse;
      }

      // the following methods are only implemented in this class to
      // ensure the correct input data type. If that's not needed you can skip implementing them
      // and the parents methods are directly called then.
      delete$(id: ID, apolloOptions = {}): Observable<boolean> {
        return super.delete$(id, apolloOptions);
      }

      create$(createTodoInput: CreateTodoInput, apolloOptions): Observable<Todo> {
        return super.create$(createTodoInput, apolloOptions);
      }

      update$(updateTodoInput: UpdateTodoInput, apolloOptions = {}): Observable<Todo> {
        return super.update$(updateTodoInput, apolloOptions);
      }
    }






Now we create the actual component logic for creating, reading, update and deleting todos in
:code:`todo-list-page.component.ts`.



.. code-block:: typescript
    :caption: Frontend/apps/web-app/src/app/todo/todo-list-page/todo-list-page.component.ts
    :name: todo-list-page-component

    import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
    import { CsdDataService } from '../../core/services/csd-data.service';
    import { allUserTodosQuery } from '../todo.graphql';
    import { Todo } from '../todo.types';
    import { CsdGqlDataSource } from '../../shared/datasource/csd-gql-data-source';
    import { CsdSnackbarService } from '../../features/csd-snackbar/csd-snackbar.service';
    import { TodoService } from '../todo.service';

    @Component({
      selector: 'dta-todo-list-page',
      templateUrl: './todo-list-page.component.html',
      styleUrls: ['./todo-list-page.component.scss'],
      changeDetection: ChangeDetectionStrategy.OnPush,
    })
    export class TodoListPageComponent implements OnInit {
      dataSource: CsdGqlDataSource<Todo>;

      constructor(
        protected csdDataService: CsdDataService,
        protected csdSnackbarService: CsdSnackbarService,
        protected todoService: TodoService
      ) {
        // A datasource is an abstraction which lets you handle large quantities of data
        // in an easy way. It helps with filtering, sorting, and pagination.
        this.dataSource = new CsdGqlDataSource<Todo>({
          gqlQuery: allUserTodosQuery, // our todo list fetch query
          gqlQueryVariables: {},
          gqlItemsPath: 'me.ownedOrganisation.todos', // path in the query to the todo connection
          csdDataService, // the http link which uses apollo underneath
        });

        this.dataSource.connect();
      }

      ngOnInit(): void {}

      addTodo(title: string) {
        // Here we create a new todo. We use optimistic UI to get an enhanced UX which is extremely
        // responsive also on bad internet connections
        console.log('TodoListPageComponent.addTodo');

        if (!title) {
          // show an error in case the user doesn't provide a todo tile
          this.csdSnackbarService.error('MODEL.TODO.FORM.TEXT.ERROR.REQUIRED');
          return;
        }

        // here we use the create$ method of the todoService which returns an observable,
        // so don't forget to subscribe to it.
        this.todoService
          .create$(
              // the typed input
            { text: title },
            {
              // this is optionally but we need it for the opmistic UI to also update the our
              // datasource query which leads to an updated todolist locally although it is not
              // yet saved on the server. CsdGqlDataSource provides the optimisticUpdate
              // helper methods to keep it short.
              // For a detailed explanation see https://apollo-angular.com/docs/performance/optimistic-ui
              update: (store, mutationData) =>
                this.dataSource.optimisticUpdate(
                  'create',
                  this.todoService.modelName,
                  store,
                  mutationData
                ),
            }
          )
          .subscribe(
            (result) => {
              console.log('TodoListPageComponent.addTodo completed: ', result);
            },
            (error) => {
              console.error('TodoListPageComponent.addTodo failed: ', error);
              this.csdSnackbarService.error();
            }
          );
      }

      saveTodo(todo: Todo) {
        // very similar to the addTodo()
        console.log('TodoListPageComponent.saveTodo');
        this.todoService
          .update$(todo, {
            update: (store, mutationData) =>
              this.dataSource.optimisticUpdate(
                'update',
                this.todoService.modelName,
                store,
                mutationData
              ),
          })
          .subscribe(
            (result) => {
              console.log('TodoListPageComponent.saveTodo completed: ', result);
            },
            (error) => {
              console.error('TodoListPageComponent.saveTodo failed: ', error);
              this.csdSnackbarService.error();
            }
          );
      }

      deleteTodo(todo: Todo) {
        // and also very similar to the addTodo()
        console.log('TodoListPageComponent.deleteTodo');
        this.todoService
          .delete$(todo.id, {
            update: (store, mutationData) =>
              this.dataSource.optimisticUpdate(
                'delete',
                this.todoService.modelName,
                store,
                mutationData
              ),
          })
          .subscribe(
            (result) => {
              console.log('TodoListPageComponent.deleteTodo completed: ', result);
            },
            (error) => {
              console.error('TodoListPageComponent.deleteTodo failed: ', error);
              this.csdSnackbarService.error();
            }
          );
      }

    }


To quickly check if all the wiring is working we implement a basic list without styling and best practises ;) We will
change it immediately later when everything is working as expected.

Now we have to add the HTML for showing todo items in the `todo-list-page.component.html``.


.. code-block:: html
    :caption: Frontend/apps/web-app/src/app/todo/todo-list-page/todo-list-page.component.html
    :name: todo-list-page-html-basic

    
    <div class="dta-todo-list-page csd-page">
      <div *ngFor="let todo of (dataSource.data$() | async)">
        <input
          type="checkbox"
          #isDone
          [checked]="todo?.isDone"
          (change)="saveTodo({ id: todo.id, text: todo.text, isDone: !!isDone.value })"
        />{{ todo.text }}
        <span (click)="deleteTodo(todo)">(X)</span>
      </div>

      <input
        #todoInput
        (keyup.enter)="addTodo(todoInput.value); todoInput.value = ''"
        placeholder="Add todo"
        autocomplete="off"
      />
    </div>
    



Now we should be able to add a new todo with typing some text in the input and pressing the enter key. By changing the
checkbox we can change the state of the todo. And clicking on the (X) will delete the todo with a nice
"are you sure"-Dialog. Note that every change is already implemented with optimistic UI, so change is displayed
immediately although the internet connection is slow. You can play around with simulation a slow connection in chrome
inspector in the "Network" tab.


It's working now we refactore the todo-list-page a bit in our already created components (todo-add, todo-item, todo-list)
to make the code more clean and reusable. With this change we will also introduce angular material and make it pretty
as well.


Angular Material refactoring
============================

Okay, lets start with the smalest part for the refactoring, let's try to get a single todo item in a so called
``TodoItemComponent``. We already created the skeleton for it it is in the ```todo/todo-item`` folder.
The TodoItemComponent will be a presentational component, that means we don't care about handling state, we just
emit events via Angular Outputs and react to Angular Inputs.

Let's have a look at the component code which should be pretty straight forward:


.. code-block:: typescript
    :caption: Frontend/apps/web-app/src/app/todo/todo-item/todo-item.component.ts
    :name: todo-item-component-ts

    import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
    import { cloneDeep } from '@apollo/client/utilities';
    import { Todo } from '../todo.types';

    @Component({
      selector: 'dta-todo-item',
      templateUrl: './todo-item.component.html',
      styleUrls: ['./todo-item.component.scss'],
      changeDetection: ChangeDetectionStrategy.OnPush,
    })
    export class TodoItemComponent {
      @Input() todoItem: Todo;
      @Output() deletedItem = new EventEmitter<Todo>();
      @Output() savedItem = new EventEmitter<Todo>();

      editMode = false;

      changeTitle(text: string) {
        // change title will emit the change event with a new title
        // unless the title text is blank than we assume the user wants
        // to delete the todo.
        if (!text) {
          this.deletedItem.emit(this.todoItem);
          return;
        }

        let changedTodo = cloneDeep(this.todoItem);
        changedTodo.text = text;
        this.savedItem.emit(changedTodo);
        this.editMode = false;
      }

      changeCompleted(isDone: boolean) {
        // emits a change to the isDone state of a todo
        let changedTodo = cloneDeep(this.todoItem);
        changedTodo.isDone = isDone;
        this.savedItem.emit(changedTodo);
      }
    }


Based on this component code we can implement the template. Nothing complicated in there but some nice UX improvements
are in there (strike through of done todos, edit on double click, etc) which makes it a bit more code.


.. code-block:: html
    :caption: Frontend/apps/web-app/src/app/todo/todo-item/todo-item.component.html
    :name: todo-item-component-html


    
    <div class="dta-todo-item">
      <ng-container *ngIf="!editMode; else elseBlock">
        <mat-checkbox
          [checked]="todoItem.isDone"
          (change)="changeCompleted(!todoItem.isDone)"
        ></mat-checkbox>
        <div
          class="dta-todo-text"
          [style.text-decoration]="todoItem.isDone ? 'line-through' : 'none'"
          (dblclick)="editMode = true"
        >
          {{ todoItem.text }}
        </div>
        <div class="dta-actions">
          <button class="dta-edit" (click)="editMode = true" mat-icon-button><mat-icon>edit</mat-icon></button>
          <button class="dta-delete" (click)="deletedItem.emit(todoItem)" mat-icon-button>
            <mat-icon>delete_outline</mat-icon>
          </button>
        </div>
      </ng-container>

      <ng-template #elseBlock>
        <mat-form-field class="dta-edit-todo">
          <input
            matInput
            #changedTodoTitle
            [value]="todoItem.text"
            (keyup.enter)="changeTitle(changedTodoTitle.value)"
            autocomplete="off"
          />
        </mat-form-field>
        <button
          class="dta-save-button"
          mat-flat-button
          color="primary"
          (click)="changeTitle(changedTodoTitle.value)"
        >
          save
        </button>
      </ng-template>
    </div>
    


To bring a bit more design to the TodoItemComponent we will also create a scss. The contrast to the traditional approach
we are not using the component scss. We are using a separate themed scss system which is not that strictly encapsulated
as the angular syste.

Why are we using this? It has some advantages, you can create multiple themes (eg. dark and light mode)
and switch between them by just changing a css class on the app root element. You can also extend it to make a fully
dynamic theme based on user input and rendered on the server for advanced white label solutions. Imagine every user of
the todo app can create it's own theme dynamically in the user settings. That's possible with a separate scss aproach
not with the normal angular approach.

Therfore our scss files for this tutorial live in ``Frontend/apps/web-app/src/scss/themes/dta/mixins/``.


Okay lets start with the mixin for the TodoItemComponent. We create one mixin for each component to have a lot of
flexibility and because then our scss files are more readable. Another reason for having mixins as suggested by
angular material is that you can use the theme and typography system.


.. code-block:: scss
    :caption: Frontend/apps/web-app/src/scss/themes/dta/mixins/_todo-item.component.scss
    :name: todo-item-component-scss

    @mixin dta-todo-item-component($theme, $typo) {
      $primary: map-get($theme, primary);
      $accent: map-get($theme, accent);
      $warn: map-get($theme, warn);
      $background: map-get($theme, background);
      $foreground: map-get($theme, foreground);

      .dta-todo-item {
        text-decoration: none;
        display: flex;
        justify-content: space-between;
        align-items: center;

        padding: 8px 25px;
        margin: 8px 0;
        border-radius: 4px;
        border: 1px mat-color($mat-grey, 300) solid;
        background-color: mat-color($background, 'card');

        .dta-todo-text {
          @include mat-typography-level-to-styles($typo, 'body-2');
          margin: 0 20px;
          flex-grow: 1;
        }

        .dta-edit-todo {
          width: 80%;
        }

        .dta-save-button {
          font-size: 11px;
          line-height: 0px;
        }
      }
    }


Okay we are done with our todo item now let's use it. We will use it in our ``TodoListComponent``
(not the TodoListPageComponent). Because this component is still untouched we well add this code to it.

In the Template we add this code which already uses the ``dta-todo-item`` which is our ``TodoItemComponent``

.. code-block:: html
    :caption: Frontend/apps/web-app/src/app/todo/todo-list/todo-list.component.html
    :name: todo-list-component-html


    
    <div class="dta-todo-list">
      <div *ngFor="let todo of dataSource.data$() | async">
        <dta-todo-item
          (savedItem)="savedItem.emit($event)"
          (deletedItem)="deletedItem.emit($event)"
          [todoItem]="todo"
        ></dta-todo-item>
      </div>
    </div>
    

This is again a representational component, which just forwards events and properties therefore the component class
is pretty short

.. code-block:: typescript
    :caption: Frontend/apps/web-app/src/app/todo/todo-list/todo-list.component.ts
    :name: todo-list-component-ts

    import {
      Component,
      OnInit,
      ChangeDetectionStrategy,
      Input,
      Output,
      EventEmitter,
    } from '@angular/core';
    import { CsdGqlDataSource } from '../../shared/datasource/csd-gql-data-source';
    import { UnsubscribeBaseComponent } from '../../shared/unsubscribe-base.component';
    import { Todo } from '../todo.types';

    @Component({
      selector: 'dta-todo-list',
      templateUrl: './todo-list.component.html',
      styleUrls: ['./todo-list.component.scss'],
      changeDetection: ChangeDetectionStrategy.OnPush,
    })
    export class TodoListComponent extends UnsubscribeBaseComponent implements OnInit {
      @Input() dataSource: CsdGqlDataSource<Todo>;
      @Output() deletedItem = new EventEmitter<Todo>();
      @Output() savedItem = new EventEmitter<Todo>();

      ngOnInit() {}
    }


Finally we add now the ``TodoListComponent`` to our ``TodoListPageComponent`` template


.. code-block:: html
    :caption: Frontend/apps/web-app/src/app/todo/todo-list-page/todo-list-page.component.html
    :name: todo-list-page-html-basic-improved

    
    <div class="dta-todo-list-page csd-page">
      <h1 class="csd-title">{{ 'MODEL.TODO.FORM.LIST_TITLE' | i18next }}</h1>
      <dta-todo-list
        [dataSource]="dataSource"
        (savedItem)="saveTodo($event)"
        (deletedItem)="deleteTodo($event)"
      ></dta-todo-list>

      <input
        #todoInput
        (keyup.enter)="addTodo(todoInput.value); todoInput.value = ''"
        placeholder="Add todo"
        autocomplete="off"
      />
    </div>
    

Our todo list should look pretty nice in with the new angular material components and inputs.

Only the input for adding a todo is still plain html without styling, we will change that quickly and also refactor
it on a representational component. The ``TodoAddComponent`` whos skeleton we have already created in the beginning:

We start with the component code as it is very short, because we only have one event to emit, when someone has added
a todo:

.. code-block:: typescript
    :caption: Frontend/apps/web-app/src/app/todo/todo-add/todo-add.component.ts
    :name: todo-add-component-ts

    import { Component, OnInit, ChangeDetectionStrategy, EventEmitter, Output } from '@angular/core';

    @Component({
      selector: 'dta-todo-add',
      templateUrl: './todo-add.component.html',
      styleUrls: ['./todo-add.component.scss'],
      changeDetection: ChangeDetectionStrategy.OnPush,
    })
    export class TodoAddComponent implements OnInit {
      constructor() {}
      @Output() addedTodo = new EventEmitter<string>();

      ngOnInit(): void {}
    }



The template is also very simple, just an input and some convenience icon buttons for clearing the input

.. code-block:: html
    :caption: Frontend/apps/web-app/src/app/todo/todo-add/todo-add.component.html
    :name: todo-add-html

    
    <div class="dta-todo-add">
      <mat-form-field class="dta-add-form-field">
        <mat-label>Add Todo</mat-label>
        <input
          class="dta-text-input"
          matInput
          #todoInput
          (keyup.enter)="addedTodo.emit(todoInput.value); todoInput.value = ''"
          (keyup.escape)="todoInput.value = ''; todoInput.blur()"
          autocomplete="off"
        />
        <mat-icon class="dta-add-icon" matPrefix>add</mat-icon>
        <button
          mat-button
          *ngIf="todoInput.value"
          matSuffix
          mat-icon-button
          aria-label="Clear"
          (click)="todoInput.value = ''"
        >
          <mat-icon>close</mat-icon>
        </button>
      </mat-form-field>
    </div>
    


Now that we also have the ``dta-todo-add`` component, we can finalize our ``TodoListPageComponent`` to only composite
existing components:

.. code-block:: html
    :caption: Frontend/apps/web-app/src/app/todo/todo-list-page/todo-list-page.component.html
    :name: todo-list-page-html-advanced

    
    <div class="dta-todo-list-page csd-page">
      <h1 class="csd-title">{{ 'MODEL.TODO.FORM.LIST_TITLE' | i18next }}</h1>
      <dta-todo-list
        [dataSource]="dataSource"
        (savedItem)="saveTodo($event)"
        (deletedItem)="deleteTodo($event)"
      ></dta-todo-list>
      <dta-todo-add (addedTodo)="addTodo($event)"></dta-todo-add>
    </div>
    


That's now an easily comprehensible component template. Short and composited by representational components. The only
smart component in this example ist the ``TodoListPageComponent`` as it communicates with the apollo store through
the TodoService and has the datasource instance.


And that’s all, now the only thing left is to write end-to-end tests for
our simple frontend app.

You'll also see that some translations are missing. We already added one translation string. Here is the complete translation file for english and for german:

.. code-block:: json
    :caption: English translation: Frontend/apps/web-app/src/assets/i18n/en.vsp.json
    :name: English translation for todo app

    {
      "MODEL": {
        "TODO": {
          "CLS": "Todo",
          "FILTER": {
            "IS_DONE_TRUE": "done",
            "IS_DONE_FALSE": "not done"
          },
          "FORM": {
            "SECTION_TODO_INFORMATION": "Todo details",
            "ADD_NEW_ITEM": "Add new item",
            "DELETE_ITEM": "Delete item",
            "LIST_TITLE": "My List",
            "SEARCH_PLACEHOLDER": "Search",
            "ERROR": {
              "REQUIRED": "This field is required",
              "INVALID_FORM_DATA": "Please fix your input."
            },
            "TEXT": {
              "LABEL": "Description"
            },
            "ID": {
              "LABEL": "ID"
            },
            "IS_DONE": {
              "LABEL": "Marked as done"
            },
            "ACTIONS": {
              "LABEL": "Actions"
            }
          }
        }
      },
      "PAGE_TITLE": {
        "TODO_MANAGEMENT": "Todo management"
      },
      "TODO_LIST": {
        "ADD_NEW_BUTTON": "Add new todo",
        "FILTER_BUTTON": "Filter"
      }
    }




.. code-block:: json
    :caption: English translation: Frontend/apps/web-app/src/assets/i18n/en.vsp.json
    :name: English translation for todo app

    {
      "MODEL": {
        "TODO": {
          "CLS": "Todo"
          },
          "FORM": {
            "TEXT": {
              "LABEL": "Description",
              "ERROR": {
                "REQUIRED": "Todo text is required!"
              }
            }
          }
        }
      },
      "PAGE_TITLE": {
        "TODO_LIST": "Todo Liste"
      },


Writing frontend e2e tests
**************************

Our end to end tests (e2e) are in a separate project called ``web-app-e2e``. All files
related to e2e testing should be there (in contrast to the frontend unit tests which are inside
the source code of the web-app)

We start by creating our page object helper for the todo list, these will help getting DOM elements
and separate the test logic from actual DOM element fetching. This leads to testcode which is more
robust to DOM structure changes.


.. code-block:: typescript
    :caption: Frontend/apps/web-app-e2e/src/support/todo.po.ts
    :name: e2e-todo-po

    export const getTodoItemText = () => cy.get('.dta-todo-text');
    export const getAddTodoInput = () => cy.get('.dta-todo-add .dta-text-input');
    export const getEditTodoInput = () => cy.get('.dta-edit-todo input');
    export const getDeleteButton = () => cy.get('.dta-actions .dta-delete');
    export const getEditButton = () => cy.get('.dta-actions .dta-edit');
    export const getConfirmDeleteButton = () => cy.get('.mat-dialog-actions button.csd-confirm-button');
    export const getTodoItem = () => cy.get('.dta-todo-item');


Now we can quickly create three e2e tests for testing adding, deleting and changing of a todo.

.. code-block:: typescript
    :caption: Frontend/apps/web-app-e2e/src/support/todo.po.ts
    :name: e2e-todo-po

   
    import { loginDefaultUser } from '../support/utils';
    import { getTodoPage } from '../support/login.po';
    import {
      getDeleteButton,
      getConfirmDeleteButton,
      getEditButton,
      getAddTodoInput,
      getTodoItemText,
      getTodoItem, getEditTodoInput,
    } from '../support/todo.po';

    describe('Todo crud', () => {
      beforeEach(() => {
        loginDefaultUser();
        cy.visit('/');
        // wait for the app to be loaded:
        getTodoPage();
      });

      it('should create todo', () => {
        const todoText = 'This needs to be done!';
        getAddTodoInput().type(todoText + '{enter}');
        getTodoItemText().contains(todoText);
      });

      it('should delete todo', () => {
        const todoText = 'This needs to be done!';
        getAddTodoInput().type(todoText + '{enter}');
        getTodoItemText()
          .contains(todoText)
          .parent()
          .within(() => getDeleteButton().click());
        getConfirmDeleteButton().click();
        getTodoItem()
          .contains(todoText)
          .should('not.exist');
      });

      it('should update todo', () => {
        const todoText = 'This needs to be done!';
        const newTodoText = 'This is updated text';

        getAddTodoInput().type(todoText + '{enter}');
        getTodoItemText()
          .contains(todoText)
          .parent()
          .within(() => {
            getEditButton().click()
            getEditTodoInput().clear().type(newTodoText  + '{enter}');
          });
        getTodoItemText().contains(newTodoText).should('exist');

      });
    });

   


You see with cypress writing tests is really easy and very compact.

You can run tests with:

.. code-block:: bash

   ./cli/run_tests_frontend_e2e_webapp_dev.sh

Now if you try to run e2e tests, you could see that they are failing.
If you go all the way to the start of frontend tutorial, you can see that we have changed the default component from ``dashboard``  to our ``todo app``.
We need to adjust these changes in order to have successful tests once again. Add following line in ``login.po.ts.``

.. code-block:: typescript
    :caption: Frontend/apps/web-app-e2e/src/support/login.po.ts
    :name: e2e-login-po
    export const getTodoPage = (options?) => cy.get('csd-todo-list-page', options);

This constant will enable us to check if todo component exists when page is loaded.
Next, in ``login.spec.ts`` and ``register.spec.ts`` replace all occurances of ``getDashboardComponent()``  and ``getGermanDashboardComponent()`` with ``getTodoPage()`` as that is our default page now.
Last test that we need to fix is ``user-invitation.spec.ts`` , where we need to replace ``getDashboardComponent({ timeout: 10000 });`` with ``getTodoPage({ timeout: 10000 });`` as we need to wait some time in order to complete the invitation.
That's it, now you have fully functional e2e testing!

For specific questions, please check cypress documentation https://docs.cypress.io/api/api/table-of-contents.html