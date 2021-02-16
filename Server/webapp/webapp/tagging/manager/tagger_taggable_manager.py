# based on https://github.com/jazzband/django-taggit
#
# Copyright (c) Alex Gaynor and individual contributors.
# All rights reserved.
#
# Redistribution and use in source and binary forms, with or without modification,
# are permitted provided that the following conditions are met:
#
#     1. Redistributions of source code must retain the above copyright notice,
#        this list of conditions and the following disclaimer.
#
#     2. Redistributions in binary form must reproduce the above copyright
#        notice, this list of conditions and the following disclaimer in the
#        documentation and/or other materials provided with the distribution.
#
#     3. Neither the name of django-taggit nor the names of its contributors
#        may be used to endorse or promote products derived from this software
#        without specific prior written permission.
#
# THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
# ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
# WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
# DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
# ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
# (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
# LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
# ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
# (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
# SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

import taggit.managers
from django.db import router
from django.db.models import signals
from taggit.utils import require_instance_manager

from webapp.tagging.models.tagged_item import TaggedItem


class TaggerTaggableManager(taggit.managers.TaggableManager):
    def __init__(self, *args, **kwargs):
        self._field_name = kwargs.pop('field_name', None)
        kwargs.setdefault('through', TaggedItem)
        kwargs.setdefault('manager', _TaggerTaggableManager)
        super().__init__(*args, **kwargs)

    def __get__(self, instance, model):
        if instance is not None and instance.pk is None:
            raise ValueError(
                "%s objects need to have a primary key value "
                "before you can access their tags." % model.__name__
            )
        manager = self.manager(
            field_name=self._field_name,
            through=self.through,
            model=model,
            instance=instance,
            prefetch_cache_name=self.name,
        )
        return manager


class _TaggerTaggableManager(taggit.managers._TaggableManager):
    def __init__(self, field_name, *args, **kwargs):
        self._field_name = field_name
        super().__init__(*args, **kwargs)

    def get_field_name(self):
        return self._field_name

    @require_instance_manager
    def add_tags(self, *tags, tagger_organisation, **kwargs):
        tag_kwargs = kwargs.pop("tag_kwargs", {})
        db = router.db_for_write(self.through, instance=self.instance)

        tag_objs = self._to_tag_model_instances(tags, tag_kwargs)
        new_ids = {t.pk for t in tag_objs}

        # NOTE: can we hardcode 'tag_id' here or should the column name be got
        # dynamically from somewhere?
        vals = (
            self.through._default_manager.using(db)
            .values_list("tag_id", flat=True)
            .filter(**self._lookup_kwargs())
        )

        new_ids = new_ids - set(vals)

        signals.m2m_changed.send(
            sender=self.through,
            action="pre_add",
            instance=self.instance,
            reverse=False,
            model=self.through.tag_model(),
            pk_set=new_ids,
            using=db,
        )

        for tag in tag_objs:
            self.through._default_manager.using(db).get_or_create(
                tag=tag, tagger_organisation=tagger_organisation, **self._lookup_kwargs()
            )

        signals.m2m_changed.send(
            sender=self.through,
            action="post_add",
            instance=self.instance,
            reverse=False,
            model=self.through.tag_model(),
            pk_set=new_ids,
            using=db,
        )

    pass
