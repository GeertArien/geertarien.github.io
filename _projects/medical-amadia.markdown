---
layout: post
title:  "Medical Amadia"
tags: ERP Odoo Python Linux
sidebar: true
text: true
description:  Medical module for the Odoo ERP system. Created for a non-profit
              organization in Madagascar.
repo: medical-amadia
image: /assets/images/projects/medical-amadia.jpg
---
For an international internship I spent three months in Madagascar. Three weeks
of those I was traveling through the country, from the east to the west coast
(check the [photography section](/photography/) for some pictures of that trip).
The other two and a half months I stayed in Antananarivo, the capital of
Madagascar, implementing a medical ERP system for Amadia, a non-profit
organization.

{% include image.html
name="amadia-view.jpg"
caption="Amadia's hospital in Antananarivo lies atop a small hill, the top floor has a
balcony which features this amazing view of the capital city of Madagascar."
alt="Antananarivo view"
%}

[Amadia][amadia], a Madagascar based non-profit organization focusing on diabetes
patients, was in need of an ERP system to manage their activities. Crucial to
the organization was that the ERP system was adapted to their needs and that
the cost price was kept as low as possible.

After comparing the available options, [Odoo][odoo] was chosen as the ERP system for
this project. The decisive factors were Odoo’s open source nature and it’s
modular design. It allows users to choose and install the
functionality they need as well as extend the system in a systematic way, which
was exactly what we needed.

{% include image.html
name="odoo-modules.jpg"
caption="Extra modules can be installed using Odoo's user interface."
alt="Odoo modules"
%}

Odoo is an ERP system that uses a client/server architecture in which clients
are web browsers accessing the Odoo server via Remote Procedure Call.
Furthermore it also features an Object-Relational Mapping layer and follows
the Model-View-Controller architectural pattern. [PostgreSQL][postgresql] is
used as database backend.

Following the MVC pattern, business objects are declared as [Python][python]
classes:

{% highlight python %}
from openerp import models, fields

class MedicalPatientAllergy(models.Model):
    _name = 'medical.patient.allergy'
    _description = 'Medical Patient Allergy'

    name = fields.Char(required=True,
       translate=True, )
{% endhighlight %}

While views are defined using [XML][xml]:

{% highlight xml %}
<record id="medical_prescription_tree_view"
  model="ir.ui.view">
    <field name="name">
      medical.prescription.tree
    </field>
    <field name="model">
      medical.prescription
    </field>
    <field name="arch" type="xml">
        <tree string="Medical Prescription">
        	<field name="id"/>
            <field name="medical_patient_id" />
            <field name="date" />
            <field name="prescription_ids"/>
        </tree>
    </field>
</record>
{% endhighlight %}

To adapt the ERP system to the requirements of the Amadia organization, a fork
was created of an existing healthcare module called
[Odoo Medical][odoo-medical]. This open source module is maintained by the
[Odoo Community Association][oca] and was only partially implemented. The module
was further implemented and extended with specific modifications required by the
Amadia organization.

Among the new features added for Amadia, the most prominent are the following:
* Prescriptions
* Observations
* Medical services
* Hospitalizations
* Automated stock management

{% include image.html
name="odoo-hospitalization.jpg"
caption="Editing a hospitalization record in Odoo."
alt="Odoo hospitalization"
%}

Besides the development of the ERP system, I was also responsible for the
installation and configuration of the server at Amadia's hospital in
Antananarivo. The application was installed on a server running
[Debian][debian], a popular Linux distribution which is renowned for its
stability. The server was configured with security in mind and the application
was secured by sending all traffic through HTTPS. This was accomplished by using
the [Nginx][nginx] webserver as a reverse proxy server that redirects traffic
on the HTTPS port to Odoo.

The final Odoo module that I created for Amadia is available on
[github][medical-amadia]. For more information about the development environment
as well as the installation and configuration of Debian, Odoo and Nginx, please
refer to the [technical documentation][tech-doc].





[odoo]: https://www.odoo.com/
[amadia]: http://www.idf.org/membership/afr/madagascar/association-malgache-contre-le-diabete
[odoo-medical]: https://github.com/OCA/vertical-medical
[postgresql]: https://www.postgresql.org/
[oca]: http://odoo-community.org/
[python]: https://www.python.org/
[xml]: https://www.w3schools.com/xml/
[debian]: https://www.debian.org/
[nginx]: https://www.nginx.com/
[medical-amadia]: https://github.com/GeertArien/medical-amadia
[tech-doc]: https://github.com/GeertArien/medical-amadia/blob/8.0-adaption_amadia/medical_documentation/Technical_Documentation.asc
