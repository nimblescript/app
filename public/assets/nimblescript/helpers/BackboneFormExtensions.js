require(['backbone-forms', 'backbone-forms-bootstrap'],
    function (BackboneForms)
    {
        BackboneForms.editors.Date = BackboneForms.editors.Base.extend(
            {
                render: function ()
                {
                    this.editor = new BackboneForms.editors.Text({
                        key: this.key,
                        schema: this.schema,
                        value: this.schema.value
                    }).render();

                    var $el = $(BackboneForms.templates.date({
                        value: this.schema.value || '',
                        format: this.schema.format || '',
                        editor: '<b class="bbf-tmp"></b>'
                    }));

                    $el.find('.bbf-tmp').replaceWith(this.editor.el);

                    this.setValue(this.value);
                    this.setElement($el);
                    this.$el.datepicker({ autoclose: true });
                    return this;
                },
                setValue: function (value)
                {
                    this.editor.setValue(value);
                },
                getValue: function ()
                {
                    return this.editor.getValue();
                },
                validate: function ()
                {
                    return this.editor.validate();
                },
                focus: function()
                {
                    this.editor.focus();
                },
                blur: function()
                {
                    this.editor.blur();
                },
                remove: function()
                {
                    this.editor.remove();
                    this._super();
                }
            });

        BackboneForms.editors.HtmlEditor = BackboneForms.editors.TextArea.extend({
            render: function ()
            {
                this._super();
                var self = this;
                setTimeout(function ()
                {
                    self.$el.cleditor({
                        height: self.schema.height || 200, width: self.schema.width || '100%',
                        controls: "bold italic underline strikethrough subscript superscript | font size " +
                        "style | color highlight removeformat | bullets numbering | outdent " +
                        "indent | alignleft center alignright justify | undo redo | " +
                        "link unlink | cut copy paste pastetext"
                    });
                    self.timer = setInterval(function ()
                    {
                        self.$el.cleditor()[0].updateTextArea(true);
                    },50)
                }, 1);
                return this;
            },
            getValue: function ()
            {
                var value = this._super();
                if (value == '<br>' || value == '<p>&nbsp;</p>' ) // Treat as empty
                    value = '';
                return value;
            },
            remove: function ()
            {
                if (this.timer)
                    clearInterval(this.timer);
                this._super();
            }
        })

        BackboneForms.setTemplates({
            date: '\
		<div class="input-append date" data-date="{{ value }}" data-date-format="{{ format }}">\
			{{editor}}\
			<span class="add-on"><i class="icon-calendar"></i></span>\
		</div>\
	    '
        })
    }
);
    