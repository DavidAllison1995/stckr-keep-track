
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const today = new Date()
    const threeDaysFromNow = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000)
    const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)

    // Get user settings to filter notifications
    const { data: userSettings } = await supabaseClient
      .from('user_settings')
      .select('user_id, notification_task_due_soon, notification_task_overdue, notification_task_due_today, notification_warranty_expiring, notification_recurring_task_reminder')

    const userSettingsMap = new Map(
      userSettings?.map(setting => [setting.user_id, setting]) || []
    )

    // 1. Check for tasks due today
    const { data: tasksDueToday } = await supabaseClient
      .from('maintenance_tasks')
      .select('id, user_id, title, date, item_id')
      .eq('status', 'pending')
      .eq('date', today.toISOString().split('T')[0])

    for (const task of tasksDueToday || []) {
      const userSettings = userSettingsMap.get(task.user_id)
      if (!userSettings?.notification_task_due_today) continue

      // Check if notification already exists
      const { data: existingNotification } = await supabaseClient
        .from('notifications')
        .select('id')
        .eq('user_id', task.user_id)
        .eq('task_id', task.id)
        .eq('type', 'task_due_today')
        .single()

      if (!existingNotification) {
        await supabaseClient
          .from('notifications')
          .insert({
            user_id: task.user_id,
            type: 'task_due_today',
            title: `Due Today: ${task.title}`,
            message: `Today: '${task.title}' is due.`,
            task_id: task.id,
            item_id: task.item_id
          })
      }
    }

    // 2. Check for tasks due soon (3 days, excluding today)
    const { data: tasksDueSoon } = await supabaseClient
      .from('maintenance_tasks')
      .select('id, user_id, title, date, item_id')
      .eq('status', 'pending')
      .gt('date', today.toISOString().split('T')[0])
      .lte('date', threeDaysFromNow.toISOString().split('T')[0])

    for (const task of tasksDueSoon || []) {
      const userSettings = userSettingsMap.get(task.user_id)
      if (!userSettings?.notification_task_due_soon) continue

      // Check if notification already exists
      const { data: existingNotification } = await supabaseClient
        .from('notifications')
        .select('id')
        .eq('user_id', task.user_id)
        .eq('task_id', task.id)
        .eq('type', 'task_due_soon')
        .single()

      if (!existingNotification) {
        const daysUntilDue = Math.ceil((new Date(task.date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        await supabaseClient
          .from('notifications')
          .insert({
            user_id: task.user_id,
            type: 'task_due_soon',
            title: `Task Due Soon: ${task.title}`,
            message: `Reminder: '${task.title}' is due in ${daysUntilDue} day(s).`,
            task_id: task.id,
            item_id: task.item_id
          })
      }
    }

    // 3. Check for overdue tasks
    const { data: overdueTasks } = await supabaseClient
      .from('maintenance_tasks')
      .select('id, user_id, title, date, item_id')
      .in('status', ['pending', 'due_soon'])
      .lt('date', today.toISOString().split('T')[0])

    for (const task of overdueTasks || []) {
      const userSettings = userSettingsMap.get(task.user_id)
      if (!userSettings?.notification_task_overdue) continue

      // Check if notification already exists
      const { data: existingNotification } = await supabaseClient
        .from('notifications')
        .select('id')
        .eq('user_id', task.user_id)
        .eq('task_id', task.id)
        .eq('type', 'task_overdue')
        .single()

      if (!existingNotification) {
        await supabaseClient
          .from('notifications')
          .insert({
            user_id: task.user_id,
            type: 'task_overdue',
            title: `Task Overdue: ${task.title}`,
            message: `Overdue: '${task.title}' was due on ${new Date(task.date).toLocaleDateString()}.`,
            task_id: task.id,
            item_id: task.item_id
          })

        // Update task status to overdue
        await supabaseClient
          .from('maintenance_tasks')
          .update({ status: 'overdue' })
          .eq('id', task.id)
      }
    }

    // 4. Check for recurring task reminders (3 days before next instance)
    const { data: recurringTasks } = await supabaseClient
      .from('maintenance_tasks')
      .select('id, user_id, title, date, item_id, recurrence')
      .neq('recurrence', 'none')
      .eq('status', 'pending')
      .gte('date', today.toISOString().split('T')[0])
      .lte('date', threeDaysFromNow.toISOString().split('T')[0])

    for (const task of recurringTasks || []) {
      const userSettings = userSettingsMap.get(task.user_id)
      if (!userSettings?.notification_recurring_task_reminder) continue

      // Check if notification already exists
      const { data: existingNotification } = await supabaseClient
        .from('notifications')
        .select('id')
        .eq('user_id', task.user_id)
        .eq('task_id', task.id)
        .eq('type', 'recurring_task_reminder')
        .single()

      if (!existingNotification) {
        await supabaseClient
          .from('notifications')
          .insert({
            user_id: task.user_id,
            type: 'recurring_task_reminder',
            title: `Recurring Task Reminder: ${task.title}`,
            message: `'${task.title}' recurs soon on ${new Date(task.date).toLocaleDateString()}.`,
            task_id: task.id,
            item_id: task.item_id
          })
      }
    }

    // 5. Check for warranties expiring soon (7 days)
    const { data: itemsWarrantyExpiring } = await supabaseClient
      .from('items')
      .select('id, user_id, name, warranty_date')
      .not('warranty_date', 'is', null)
      .gte('warranty_date', today.toISOString().split('T')[0])
      .lte('warranty_date', sevenDaysFromNow.toISOString().split('T')[0])

    for (const item of itemsWarrantyExpiring || []) {
      const userSettings = userSettingsMap.get(item.user_id)
      if (!userSettings?.notification_warranty_expiring) continue

      // Check if notification already exists
      const { data: existingNotification } = await supabaseClient
        .from('notifications')
        .select('id')
        .eq('user_id', item.user_id)
        .eq('item_id', item.id)
        .eq('type', 'warranty_expiring')
        .single()

      if (!existingNotification) {
        await supabaseClient
          .from('notifications')
          .insert({
            user_id: item.user_id,
            type: 'warranty_expiring',
            title: `Warranty Expiring: ${item.name}`,
            message: `Warranty expires on ${new Date(item.warranty_date).toLocaleDateString()}`,
            item_id: item.id
          })
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Notifications generated successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error generating notifications:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
