"""
    The webapp.gql module offers the server-side GraphQL interface.
"""

import logging

from graphene import relay

log = logging.getLogger(__name__)


def from_global_id(global_id):
    return global_id.split(':') if global_id else (None, None)


def to_global_id(type, id):
    return '{}:{}'.format(type, id)


class Node(relay.Node):
    @classmethod
    def from_global_id(cls, global_id):
        return from_global_id(global_id)

    @classmethod
    def to_global_id(cls, type, id):
        return to_global_id(type, id)

    @classmethod
    def get_node_from_global_id(cls, info, global_id, only_type=None):
        try:
            _type, _id = cls.from_global_id(global_id)
            graphene_type = info.schema.get_type(_type).graphene_type
        except Exception as e:
            log.exception('', exc_info=e)
            return None

        if only_type:
            assert graphene_type == only_type, ("Must receive a {} id.").format(
                only_type._meta.name
            )

        # We make sure the ObjectType implements the "Node" interface
        if cls not in graphene_type._meta.interfaces:
            return None

        get_node = getattr(graphene_type, "get_node", None)
        if get_node:
            return get_node(info, _id)
