eng
===

This is an e-Learning Community, which enables its members to learn from each other.

The Community differentiates itself to other learning websites in several ways:
1. It's a totally free community, where people can study whatever subject without paying money for it.
2. It's based on peer-assisted study model: all the learning materials and methods are contributed by members.
3. It's a open source project (applies LGPL 3.0 License).
4. The user interface is clean and clear. No ads or commercials.

High level functional considerations:
1. Users can upload their interested learning materials, markup their notes, comments and understandings. These documents can also be reviewed, commented, forwarded, or scored by other users;
2. Materials with highest scores will be recommended to other users who concern the specific subject;
3. By following another user, an user can see all the new materials it published.
4. A group of users can share a set of materials to form a study team, in which they can compare progress, discuss issues and challenge each other.
5. Provide random user pairing option for day-to-day practice.

Technical Architecture:
1. Back-end is a set of Node.js Restful API.
2. Front-end is a AngularJS single page app, which communicates with backend in JSON.
3. On data persistent, MongoDB is the back-end platform, while IndexedDB is used in front-end as offline cache.
4. Front-end could also be packaged into a Chrome App, so that offline mode being supported better.
5. Production system will be deployed on some Cloud platform, but only for developing period. No further support for the production system is guaranteed once the development work is done.

Schedule:
1. Refining functional specs:     2 weeks
2. Development and testing:       4 weeks
